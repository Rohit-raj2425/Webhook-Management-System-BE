const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebhookSubscription' },
    payload: {}, // Store the webhook payload, could be an object
    receivedAt: { type: Date, default: Date.now },
    processed: { type: Boolean, default: false },
    callbackResponse: {}, // To store the response from the callbackUrl
    callbackStatus: {type: String, enum: ['success', 'failed'],},
  },
  { timestamps: true }
);
module.exports = {
  schema: webhookEventSchema,
  tableName: "webhookEvents",
  modelName: "WebhookEvent",
  collectionName: "webhookEvents",
};
