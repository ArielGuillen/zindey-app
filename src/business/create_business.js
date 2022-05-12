const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();
const s3 = new AWS.S3();

const uuid = require('uuid');
const jimp = require('jimp');

const UPDATE_ACCOUNT_LAMBDA = process.env.UPDATE_ACCOUNT_LAMBDA;
const BUSINESS_TABLE_NAME = process.env.BUSINESS_TABLE_NAME;
const ACCOUNT_TABLE_NAME = process.env.ACCOUNT_TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;
const JIMP_QUALITY = 70;

exports.lambdaHandler = async( event ) => {

    const response = {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify({ message: "Business created successfully" }),
    };

    
    try{

        let {
            accountId,
            name,
            line,
            logo,
            branches,
            warehouses
        } = JSON.parse ( event.body );
        
        //Generate business id using uuid v4
        const id = uuid.v4();
        //Get the image decoded and optimized
        const resizedImage = await compress_image( logo );
        
        //Create object with the s3 params to upload the file
        let s3Params = {
            Bucket: BUCKET_NAME,
            Key: `business-logo-${id}.jpeg`,
            Body: resizedImage,
            ContentType: "image/jpeg",
        }

        await s3.putObject( s3Params ).promise();

        const logoUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/business-logo-${id}.jpeg`
        
        let dynamoParams = {
            TableName : BUSINESS_TABLE_NAME,
            Item: {
                id,
                name,
                line,
                logo: logoUrl,
                branches,
                warehouses
            } 
        }
        await dynamo.put( dynamoParams ).promise();

        const businessItem = await dynamo.query({ 
            TableName: ACCOUNT_TABLE_NAME,
            KeyConditionExpression: '#id = :v_id',
            ExpressionAttributeNames: {
                '#id': 'id',
            },
            ExpressionAttributeValues: {
                ':v_id': accountId
            }
        }).promise();

        response.body= JSON.stringify( { message: "Business created successfully", businessItem});

    }catch( error ){
        console.log( error );
        response.body = JSON.stringify( { 
            message: "Failed to create business",  
            error: error.message 
        } );
    }

    return response;
};

async function compress_image( imageBase64 ) {

    //Get the image and decode from base64
    const decodedImage = Buffer.from( imageBase64.replace( /^data:image\/\w+;base64,/, "" ), "base64" );

    //Convert to a jimp type for resize the image
    const jimpImage = await jimp.read( decodedImage );

    //Get the mime type for upload file to s3
    const mime = jimpImage.getMIME();

    //Resize the image using the jimpImage and get a buffer for the s3 upload
    const resizedImage = await jimpImage
        .quality( JIMP_QUALITY )
        .getBufferAsync( mime );

    return resizedImage;
}