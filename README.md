# Serverless Boilerplate

[![FIBO Logo](https://fibo.cloud/assets/images/logo.svg)](https://fibo.cloud/)

Serverless Boilerplate [Infrastructure + Services]

## Requirement

- [NodeJS](https://nodejs.org/en/download/) - NodeJS

## Run project
- First you need to find everything as "REPLACE" and replace it with your parameters.
- Then execute cloud formation such as DynamoDB, S3, Cognito


```sh
cd infastructure
yarn 
yarn build && yarn deploy
```

Run services
```sh
cd ../services
yarn
yarn deploy
```

Create Init user with shellscript

```sh
cd ../demo
chmod +x ./register.sh
```
Get token 
```sh
./register.sh
chmod +x ./login.sh
./login.sh
```


## Todos

| Status             | Name                     
| ------------------ | ------------------------
| :white_check_mark: | Infra -> Dynamo    |     
| :white_check_mark: | Infra -> S3        |
| :white_check_mark: | Infra -> Cognito       | 
| :white_check_mark: | Service -> API Gateway         |
| :white_check_mark: | Service -> Lambda   |
