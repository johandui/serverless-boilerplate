import { CfnOutput } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as sst from "@serverless-stack/resources";

export default class DynamoDBStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const app = this.node.root;
    const image = new dynamodb.Table(this, "ImagesTableName", {
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "imageId", type: dynamodb.AttributeType.STRING },
    });

    const category = new dynamodb.Table(this, "CategoriesTableName", {
      partitionKey: {
        name: "categoryType",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "categoryId", type: dynamodb.AttributeType.STRING },
    });
    new CfnOutput(image, "TableName", {
      value: image.tableName,
      exportName: app.logicalPrefixedName("ImagesTableName"),
    });

    new CfnOutput(category, "TableName", {
      value: category.tableName,
      exportName: app.logicalPrefixedName("CategoriesTableName"),
    });
  }
}
