const dynamoose = require('dynamoose');

export const categorySchema = new dynamoose.Schema(
  {
    categoryType: {
      type: String,
      hashKey: true,
    },
    categoryId: {
      type: String,
      rangeKey: true
    },
    code: {
      type: String,
      required: true,
      lowercase: true
    },
    parent: dynamoose.THIS,
    name: String
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = dynamoose.model(process.env.categoriesTableName, categorySchema, {
  create: false,
  throughput: {
    read: 5,
    write: 5,
  },
  waitForActive: false
});
