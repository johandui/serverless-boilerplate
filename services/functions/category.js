import handler from "../libs/handler-lib";
import { getFilterParams } from "../libs/utils";
import { CategoryModel } from "../models/category";

const methods = {
  GET: async function (event) {
    const { pathParameters, queryStringParameters } = event;
    if (pathParameters && pathParameters.id) {
      const t = pathParameters.id.split("@");
      const result = await CategoryModel.get({
        categoryType: t[1],
        categoryId: t[0],
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
        .reduce(
          (scan, currentValue) => {
            const [key, value] = currentValue;
            return scan.where(key).contains(value);
          },
          CategoryModel.scan()
            .count()
        )
        .exec();
      const result = await objEntries
        .reduce((scan, currentValue) => {
          const [key, value] = currentValue;
          return scan.where(key).contains(value);
        }, CategoryModel.scan())
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
          id: `${item.categoryId}@${item.categoryType}`,
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
    await CategoryModel.batchDelete(data.ids);
    return { status: true, message: "Successfully deleted" };
  },
  POST: async function (event, context) {
    // const { requestContext } = event;
    // if (requestContext && requestContext.authorizer) {
    // const { authorizer } = requestContext;
    const data = JSON.parse(event.body);
    const category = new CategoryModel({
      categoryType: data.type,
      categoryId: context.requestId,
      code: data.code,
      name: data.name,
    });
    category.save();
    return { status: true, message: "Successfully created" };
    // }
    // throw Error("Unautherized");
  },
  PUT: async function (event) {
    const { body, pathParameters } = event;
    if (!body || !pathParameters || !pathParameters.id) {
      throw Error("Missing Params");
    }
    const t = pathParameters.id.split("@");
    const data = JSON.parse(body);
    await CategoryModel.update(
      { categoryType: t[1], categoryId: t[0] },
      { ...data }
    );
    return { status: true, message: "Successfully updated" };
  },
};

export const main = handler(async (event) => {
  const { httpMethod, requestContext } = event;
  if (httpMethod) return await methods[httpMethod](event, requestContext);
  throw Error("Method not found");
});
