const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'TableName';

exports.lambdaHandler = async (event) => {

    //create the response object
    const response = {
        statusCode: 200,
        body: JSON.stringify({message : "The policy was updated successfully!"})
    };

    try{
        
        const { Items, Count } = dynamo.query( { TableName: TABLE_NAME } ).promise();
        response.body = JSON.stringif({
            message: "Get Payment Plans list succesfully",
            Count,
            Items
        });

    }catch(error){

        console.log( error );
        response.statusCode = 400;
        response.body = JSON.stringify({
            message: "Failed to get the payment plans list",
            error: error.Error
        });
        
    }

    return response;
}

