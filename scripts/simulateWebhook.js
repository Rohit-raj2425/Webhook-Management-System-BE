const axios = require('axios');

// URL of your webhook event handler endpoint
const webhookUrl = 'http://localhost:8000/v1/webhooks/event';

// Function to simulate a webhook event
async function simulateWebhookEvent() {
    const samplePayload = {
        subscriptionId: '65acea38aa976ec03b089381',
        payload: {
            message: 'Sample webhook event',
            timestamp: new Date()
        }
    };

    try {
        const response = await axios.post(webhookUrl, samplePayload);
        console.log('Webhook event simulated successfully:', response.data);
    } catch (error) {
        console.error('Error simulating webhook event:', error.message);
    }
}

// Simulate multiple events (optional)
const numberOfEvents = 5;
for (let i = 0; i < numberOfEvents; i++) {
    simulateWebhookEvent();
}
