const mongoose = require("mongoose");

const webhookSubscriptionsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: [true, "userId is required"] },
    sourceUrl: { type: String, required: true },
    callbackUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = {
  schema: webhookSubscriptionsSchema,
  tableName: "webhookSubscriptions",
  modelName: "WebhookSubscription",
  collectionName: "webhookSubscriptions",
};
