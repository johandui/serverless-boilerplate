import handler from "../libs/handler-lib";
import { asyncForEach } from "../libs/utils";

const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const bucket = process.env.Bucket;
const methods = {
  PUT: async function (event) {
    const { body } = event;
    if (!body) {
      throw Error("Missing params");
    }
    const files = JSON.parse(body);
    if (!files) {
      throw Error("Missing params");
    }
    await asyncForEach(files, async ({ name, path }) =>
      s3.deleteObject({
        Bucket: bucket,
        Key: `${path}/${name}`,
      })
    );
    return {
      status: true,
      message: "Successfully deleted",
    };
  },
  POST: async function (event) {
    const { body } = event;
    if (!body) {
      return { status: false, message: "Missing Params" };
    }
    const files = JSON.parse(body);
    if (!files) {
      throw Error("Missing params");
    }
    const urls = [];
    await asyncForEach(files, async ({ name, path, type, isbase64 }) => {
      const params = {
        Bucket: bucket,
        Key: `${path}/${name}`,
        ContentType: type,
        Expires: 60 * 24,
      };
      if (isbase64) {
        params["ContentEncoding"] = "base64";
      }
      let url = await s3.getSignedUrlPromise("putObject", params);
      urls.push(url);
    });

    return {
      status: true,
      message: "Successfully updated",
      data: urls,
    };
  },
};

export const main = handler(async (event) => {
  const { httpMethod, requestContext } = event;
  if (httpMethod) return await methods[httpMethod](event, requestContext);
  throw Error("Method not found");
});
