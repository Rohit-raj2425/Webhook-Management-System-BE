const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const router = express.Router();
const { MongoDB } = require("../database/mongodb.js");
const verifyToken = require('../middleware/verifyToken');
const retryQueue = require('../helper/retryQueue');

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await MongoDB.Users.findOne({ email });
    if (existingUser) {
        return res.status(400).send('User already exists.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const user = await MongoDB.Users.create({ username, email, password: passwordHash });
    console.log("********** ", user);
    res.status(201).send('User created successfully.');
  } catch (error) {
    console.log("error ******* ", error);
    res.status(500).send(`Error in saving user: ${error.message}.`);
  }
});

router.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await MongoDB.Users.findOne({ email });
      if (!user) {
          return res.status(400).send('User does not exist.');
      }

      // Validate password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
          return res.status(400).send('Invalid password.');
      }

      // Create and assign a token
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '24h' });
      res.header('auth-token', token).send({token});
  } catch (error) {
      res.status(500).send(`Error in user login: ${error.message}`);
  }
});

router.post('/webhooks/subscribe', verifyToken, async (req, res) => {
  try {
      const { sourceUrl, callbackUrl } = req.body;
      const userId = req.user._id;

      // Create new subscription
      const subscription = await MongoDB.WebhookSubscription.create({
          userId,
          sourceUrl,
          callbackUrl
      });

      res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    res.status(500).json({ message: `Error creating subscription: ${error.message}` });
  }
});

router.get('/webhooks/subscriptions', verifyToken, async (req, res) => {
  try {
      const userId = req.user._id;

      const subscriptions = await MongoDB.WebhookSubscription.find({ userId });
      res.json(subscriptions);
  } catch (error) {
      res.status(500).json({ message: `Error fetching subscriptions: ${error.message}` });
  }
});

router.post('/webhooks/event', async (req, res) => {
  // Validate the incoming webhook event
  const { error } = webhookEventSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { subscriptionId, payload } = req.body;

  // Process and store the event
  try {
    // Find the subscription to get the callbackUrl
    const subscription = await MongoDB.WebhookSubscription.findById(subscriptionId);
    if (!subscription) {
        return res.status(404).send('Subscription not found');
    }

    const event = await MongoDB.WebhookEvent.create({ subscriptionId, payload });

    // Call the callbackUrl (asynchronous)
    retryQueue.add({ eventId: event._id, callbackUrl: subscription.callbackUrl }, {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 1000 // delay in ms
        }
    });

    res.status(200).json({ message: 'Webhook event received and queued for processing' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing webhook event' });
  }
});

// Validation Schema
const webhookEventSchema = Joi.object({
  subscriptionId: Joi.string().required(),
  payload: Joi.object().required(),
});

router.delete('/webhooks/unsubscribe/:subscriptionId', verifyToken, async (req, res) => {
  try {
      const { subscriptionId } = req.params;
      const userId = req.user._id;

      // Find and remove the subscription
      const subscription = await MongoDB.WebhookSubscription.findOneAndDelete({ 
          _id: subscriptionId, 
          userId: userId 
      });

      if (!subscription) {
          return res.status(404).json({ message: 'Subscription not found or you do not have permission to cancel it.' });
      }

      res.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error canceling subscription' });
  }
});

module.exports = router;
