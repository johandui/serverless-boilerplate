import dynamoDb from "./dynamodb-lib";

const notincludes = "limit,offset,sorterFiled,sorterOrder";

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


export function getFilterParams(event) {
  const { queryStringParameters } = event;
  return queryStringParameters ? Object.keys(queryStringParameters)
  .filter(key => !notincludes.includes(key))
  .reduce((obj, key) => {
    return {
      ...obj,
      [key]: queryStringParameters[key]
    };
  }, {}) : {};
}


export function buildUpdateQuery(data) {
  let expression = "SET";
  const attribyte = {};
  const names = {};
  Object.keys(data).forEach((d) => {
    if (expression.length > 3) {
      expression += ",";
    }
    expression += ` #${d}=:${d} `;
    names[`#${d}`] = d;
    attribyte[`:${d}`] = data[d] || "";
  });

  return {
    attribyte,
    names,
    expression,
  };
}


export async function countAll(table) {
  const { Count } = await dynamoDb.scan({ TableName: table, Select: "COUNT" });
  return Count;
}


export function generateTimeStamp(count) {
  return 100000000000000 - count;
}
export function generatePartition(count) {
  return Math.floor(count / 100) + 1;
}


export async function checkPrivacy(table ,event){
  const { requestContext, queryStringParameters } = event;
  const params = {
    TableName: table,
    ScanIndexForward: false,
  };
  if (requestContext && requestContext.authorizer) {
    const { authorizer } = requestContext;
    const uparams = {
      TableName: user_table,
      Key: {
        id: authorizer.claims["sub"],
      },
    };
    const { Item } = await dynamoDb.get(uparams);
    if (!Item) return false;
    let filter = "is_deleted <> :is_deleted ";
    const attribute = {
      ":is_deleted": true,
    };
    const names = {};
    params["FilterExpression"] = filter;
    params["ExpressionAttributeValues"] = attribute;
    if (Item.userrole === 1) {
      filter += "AND (privacy = :public OR privacy = :division)";
      attribute[":division"] = `division-${Item.division}`;
      attribute[":public"] = "public";
      params["FilterExpression"] = filter;
      params["ExpressionAttributeValues"] = attribute;
    } else if (Item.userrole === 4) {
      filter +=
        "AND (privacy = :entire OR privacy = :public OR privacy = :nation OR #national = :national)";
      attribute[":entire"] = "entire";
      attribute[":national"] = Item.national;
      attribute[":nation"] = `national-${Item.national}`;
      attribute[":public"] = "public";
      params["FilterExpression"] = filter;
      params["ExpressionAttributeValues"] = attribute;
      params["ExpressionAttributeNames"] = {
        "#national": "national",
      };
    } else if (Item.userrole === 5) {
      filter +=
        "AND (privacy = :division OR privacy = :public OR  privacy = :nation)";
      attribute[":division"] = `division-${Item.division}`;
      attribute[":nation"] = `national-${Item.national}`;
      attribute[":public"] = "public";
      params["FilterExpression"] = filter;
      params["ExpressionAttributeValues"] = attribute;
    }

    if (
      queryStringParameters &&
      Object.keys(queryStringParameters).length > 0
    ) {
      Object.keys(queryStringParameters)
        .filter((key) => !notincludes.includes(key))
        .forEach((d) => {
          if (filter.length > 0) {
            filter += " and ";
          }

          filter += ` begins_with(#${d},:${d}) `;
          attribute[`:${d}`] = queryStringParameters[d];
          names[`#${d}`] = d;
        });
      if (Object.keys(names).length > 0) {
        params["ExpressionAttributeNames"] = names;
        params["FilterExpression"] = filter;
        params["ExpressionAttributeValues"] = attribute;
      }
    }
  }
  return params;
}


export async function checkRole(sub){
  const Item = await getCurrentUser(sub);
  if (!Item) throw Error("Permission denied");
  if (Item.userrole < 3) {
    throw Error("Permission denied");
  }
  return Item;
}


export function performPaginatedOperation(params,
  operationName, tableLastEvaluatedKeyFieldNames) {

  return new Promise((resolve, reject) => {
    const dataWithKey = {
      lastEvaluatedKey: undefined,
      result: []
    };
    const originalItemPerPageCount = params.Limit;
    params.Limit = params.Limit + 1;
    let remainingItemsCount = 0;
    dynamoDb.client[operationName](params, onScan);


    function onScan(err, data) {
      if (err) {
        return reject(err);
      }
      dataWithKey.result = dataWithKey.result.concat(data.Items);
      remainingItemsCount = (originalItemPerPageCount + 1) - dataWithKey.result.length;
      if (remainingItemsCount > 0) {
        if (typeof data.LastEvaluatedKey === "undefined") {
          return resolve(dataWithKey);
        } else {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          params.Limit = remainingItemsCount;
          dynamoDb.client[operationName](params, onScan);
        }
      } else {
        dataWithKey.result = dataWithKey.result.slice(0, originalItemPerPageCount);
        dataWithKey.lastEvaluatedKey = prepareLastEvaluatedKeyString(
          dataWithKey.result[originalItemPerPageCount - 1], tableLastEvaluatedKeyFieldNames);
        return resolve(dataWithKey);
      }
    }
  });
}

function prepareLastEvaluatedKeyString(dataObj, tableLastEvaluatedKeyFieldNames) {
  let key = "";
  tableLastEvaluatedKeyFieldNames.forEach((field) => {
    key += dataObj[field] + ",";
  });
  if (key !== "") {
    key = key.substr(0, key.length - 1);
  }
  return key;
}