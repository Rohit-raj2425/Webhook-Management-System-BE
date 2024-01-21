const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
let MongoDB = {};
const NOSQLDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const conn = await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    const baseModelPath = `${__dirname}/../models`;

    fs.readdirSync(baseModelPath)
      .filter((file) => {
        return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
      })
      .forEach((file) => {
        const model = require(path.join(baseModelPath, file));
        MongoDB[model.modelName] = mongoose.model(
          model.tableName,
          model.schema,
          model.collectionName
        );
      });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

module.exports = { NOSQLDB, MongoDB };
