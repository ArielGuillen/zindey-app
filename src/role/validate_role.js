const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

// Set the DynamoDB table name
const tableName = "zindey-app-role-table"

exports.lambdaHandler = async ( event ) => {

    //Create the response object
    const response = {
        statusCode: 200,
        body: JSON.stringify( { message: "Role valid to be created"} )
    };

    try{

        //Get the role name from the body request 
        const body = JSON.parse( event.body );
        const name = body.name;
        //Create the object with the DynamoDB params
        const params = {
            TableName : TABLE_NAME,
            IndexName : "gsiValidateName",
            KeyConditionExpression: '#name = :v_name',
            ExpressionAttributeNames: {
                '#name': 'name',
            },
            ExpressionAttributeValues: {
                ':v_name': name
            }
        };
        
        const result = await dynamo.query(params).promise();
        response.body = JSON.stringify({ message: "Role list", result });

        // Check if the result contain a value the name is repeat
        if( result.Count == 0 )
            response.body = JSON.stringify({ message: `Role ${name} valid to be created`, status: true });
        else
            response.body = JSON.stringify({ message: `Role ${name} already exist`, status: false });
    }catch( error ){
        console.log( error );
        response.statusCode = 400;
        response.body = JSON.stringify({ 
            message: "Failed to validate role", 
            error: error.message 
        });
    }

    return response;

}
