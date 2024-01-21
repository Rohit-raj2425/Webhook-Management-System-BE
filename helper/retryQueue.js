const Queue = require("bull");
const axios = require("axios");
const { MongoDB } = require("../database/mongodb.js"); // Adjust the path as necessary

// Create a Bull queue for retrying webhook events
const retryQueue = new Queue("webhook-retry", {
  redis: {
    host: process.env.REDIS_URL || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Maximum number of retries
const maxRetries = 5;

// Function to handle the job of retrying webhook events
async function retryWebhook(job) {
  const { eventId, callbackUrl } = job.data;
  let event;
  try {
    event = await MongoDB.WebhookEvent.findById(eventId);
    if (!event) throw new Error("Webhook event not found");
    console.log("^^^^^^^ callbackUrl", callbackUrl);
    // Logic to call the webhook's callback URL
    const response = await axios.post(callbackUrl, event.payload);
    // Update event with successful response
    event.callbackResponse = response.data;
    event.callbackStatus = "success";
    await event.save();
  } catch (error) {
    if (job.attemptsMade + 1 >= maxRetries) {
      // Update event with failed status after max retries
      event.callbackStatus = "failed";
      await event.save();
      throw new Error("Max retries reached");
    }
    // Re-throw the error to let Bull know it failed
    throw error;
  }
}

// Process jobs in the queue
retryQueue.process(retryWebhook);

module.exports = retryQueue;
