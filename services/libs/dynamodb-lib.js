import AWS from "aws-sdk";

const client = new AWS.DynamoDB.DocumentClient();

export const call = (action, params) => client[action](params).promise();
export const scan = (params) => client.scan(params).promise();
