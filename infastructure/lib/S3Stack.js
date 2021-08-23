import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as sst from "@serverless-stack/resources";

export default class S3Stack extends sst.Stack {
  bucket;

  constructor(scope, id, props) {
    super(scope, id, props);
    const app = this.node.root;
    this.bucket = new s3.Bucket(this, "files", {
      cors: [
        {
          maxAge: 3000,
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        },
      ],
    });

    // Export values
    new cdk.CfnOutput(this, "AttachmentsBucketName", {
      value: this.bucket.bucketName,
      exportName: app.logicalPrefixedName("AttachmentsBucketName"),
    });
  }
}
