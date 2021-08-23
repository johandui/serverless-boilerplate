const dynamoose = require('dynamoose');

require('dotenv').config();

dynamoose.AWS.config.update({
  region: 'localhost', 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'ACCESS_KEY_ID',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'SECRET_ACCESS_KEY',
});
if (process.env.NODE_ENV === 'dev') {
  const dynamoDbEndpoint = process.env.AWS_DYNAMODB_ENDPOINT || 'http://localhost:8000';
  dynamoose.local(dynamoDbEndpoint);
}

dynamoose.setDefaults({
  create: process.env.NODE_ENV === 'dev', 
  prefix: `${process.env.STAGE}.`, 
  suffix: '', 
});

module.exports = dynamoose;
