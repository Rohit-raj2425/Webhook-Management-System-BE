require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const webhookRouter = require("./routers/webhook");

async function main() {
  const { NOSQLDB } = require("./database/mongodb");
  await NOSQLDB();

  const app = express();
  app.use(bodyParser.json({ limit: "5mb" }));
  app.use("/v1", webhookRouter);
  return app;
}

main().then((app) => {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
