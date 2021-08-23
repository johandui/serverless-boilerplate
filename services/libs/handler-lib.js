//Error handler function

export default function handler(lambda) {
  return async function (event, context) {
    let body, statusCode;

    try {
      body = await lambda(event, context);
      statusCode = 200;
    } catch (e) {
      console.log("#######################START##################");
      console.error(e);
      console.log("#######################END##################");
      body = { error: e.message, status: false };
      statusCode = 500;
    }

    return {
      statusCode,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  };
}
