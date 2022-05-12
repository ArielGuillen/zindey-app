const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;

exports.lambdaHandler = async( event ) => {


    const response = {
        statusCode: 200,
        body: JSON.stringify({ message: "Successfully uploaded business" }),
    };
    
    try{
        
        //Get the id from the url params
        const id = event.pathParameters.id;
        
        let {
            accountId,
            name,
            line,
            logo,
            branches,
            warehouses
        } = JSON.parse ( event.body );

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
            TableName : TABLE_NAME,
            Item: {
                id,
                name,
                line,
                logo: logoUrl,
                branches,
                warehouses
            } 
        }
        const dynamoResponse = await dynamo.put( dynamoParams ).promise();

        response.body= JSON.stringify( { 
            message: "Business updated successfully",
            dynamoResponse
        });

    }catch( error ){
        console.log( error );
        response.body = JSON.stringify( { 
            message: "Failed to upload the business data",
            error: error.message 
        } );
    }

    return response;
}

async function compress_image( imageBase64 ) {

    //Get the image and decode from base64
    const decodedImage = Buffer.from( logo.replace( /^data:image\/\w+;base64,/, "" ), "base64" );

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