import handler from "../libs/handler-lib";
import { getFilterParams } from "../libs/utils";
import { CategoryModel } from "../models/category";
import { ImageModel } from "../models/image";

const methods = {
  GET: async function (event) {
    const { pathParameters, queryStringParameters } = event;
    if (pathParameters && pathParameters.id) {
      const t = pathParameters.id.split("@");
      const result = await ImageModel.get({
        userId: t[1],
        imageId: t[0],
      });
      if (result)
        return {
          status: true,
          data: result,
          message: "Successfully",
        };
      throw Error("Item not found.");
    } else {
      const params = getFilterParams(event);
      const objEntries = Object.entries(params);

      const countResult = await objEntries
        .reduce((scan, currentValue) => {
          const [key, value] = currentValue;
          return scan.where(key).contains(value);
        }, ImageModel.scan().count())
        .exec();
      const result = await objEntries
        .reduce((scan, currentValue) => {
          const [key, value] = currentValue;
          return scan.where(key).contains(value);
        }, ImageModel.scan())
        .startAt(
          queryStringParameters?.offset
            ? JSON.parse(queryStringParameters.offset)
            : null
        )
        .limit(queryStringParameters?.limit)
        .exec();

      return {
        status: true,
        data: result.map((item) => ({
          ...item,
          id: `${item.imageId}@${item.userId}`,
        })),
        count: countResult.count,
        offset: result.lastKey,
        message: "Successfully",
      };
    }
  },
  DELETE: async function (event) {
    const data = JSON.parse(event.body);
    if (!data || !data.ids) {
      throw Error("Params missing");
    }
    await ImageModel.batchDelete(data.ids);
    return { status: true, message: "Successfully deleted" };
  },
  POST: async function (event, context) {
    const data = JSON.parse(event.body);
    let category = null;
    if (data.category) {
      category = await CategoryModel.get({
        categoryType: data.imageType,
        categoryId: data.category,
      });
    }
    const image = new ImageModel({
      userId: event.requestContext.identity.cognitoIdentityId,
      imageId: context.requestId,
      imageType: data.imageType,
      imageUrl: data.imageUrl,
    });
    if (category) {
      image.category = category;
    }

    image.save();
    return { status: true, message: "Successfully created" };
  },
  PUT: async function (event) {
    const { body, pathParameters } = event;
    if (!body || !pathParameters || !pathParameters.id) {
      throw Error("Missing Params");
    }
    const t = pathParameters.id.split("@");
    const data = JSON.parse(body);
    await ImageModel.update({ userId: t[1], imageId: t[0] }, { ...data });
    return { status: true, message: "Successfully updated" };
  },
};

export const main = handler(async (event) => {
  const { httpMethod, requestContext } = event;
  if (httpMethod) return await methods[httpMethod](event, requestContext);
  throw Error("Method not found");
});
