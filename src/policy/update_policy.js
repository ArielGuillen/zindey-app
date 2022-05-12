const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

// Set the DynamoDB table name
const tableName = "zindey-app-policy-table"

exports.lambdaHandler = async (event) => {

    //create the response object
    const response = {
        statusCode: 200,
        body: JSON.stringify({message : "Policy updated successfully!"})
    };

    // Get and convert data from the body of the request
    const { 
        id, 
        name 
    } = JSON.parse(event.body);
    
    // Create an object with the DynamoDB parameters 
    // Item is the object to update
    var params = {
        TableName : tableName,
        Item: { 
            id,
            name
        }
    };
    try{

        const result = await dynamo.put( params ).promise();
        response.body = JSON.stringify( { 
            message: `Policy ${name} updated successfully`}, 
            result 
        );

    }catch( error ){
        console.log( error );
        response.body = JSON.stringify( { 
            message: "Failed to update policy",
            error: error.message 
        }); 
    }
    
    return response;
};
