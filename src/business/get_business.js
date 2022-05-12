const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;

exports.lambdaHandler =  async ( event ) => {
    
    const response = {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify({ message: "" }),
    };

    try{

        const businessItems = await dynamo.scan({ 
            TableName: TABLE_NAME
        }).promise();

        response.body = JSON.stringify( { 
            businessItems
        });

    } catch( error ){
        console.log( error );
        response.body = JSON.stringify( { message: "Failed to get business list",  error } );
    }
    
    return response;
}