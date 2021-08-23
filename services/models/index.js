const { CategoryModel } = require("./category");
const { ImageModel } = require("./image");
import DynamooseDataLoader from "../libs/dynomoose-model-loader";

export const Category = new DynamooseDataLoader({ model: CategoryModel });
export const Image = new DynamooseDataLoader({ model: ImageModel });
