const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { name, score, level } = body;

        if (!name || typeof score !== 'number' || typeof level !== 'number') {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Invalid input data' })
            };
        }

        const params = {
            TableName: process.env.TABLE_NAME,
            Item: {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name,
                score,
                level,
                timestamp: Date.now()
            }
        };

        await dynamoDB.put(params).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Score added successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Failed to add score' })
        };
    }
}; 