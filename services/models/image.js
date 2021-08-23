import { CategoryModel } from "./category";
const dynamoose = require("dynamoose");

export const imageSchema = new dynamoose.Schema(
  {
    userId: {
      type: String,
      hashKey: true,
    },
    imageId: {
      type: String,
      rangeKey: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imageType: {
      type: String,
      required: true,
    },
    category: CategoryModel,
  },
  {
    timestamps: true,
  }
);

export const ImageModel = dynamoose.model(process.env.imagesTableName, imageSchema, {
  create: false,
  throughput: {
    read: 5,
    write: 5,
  },
  waitForActive: false
});
