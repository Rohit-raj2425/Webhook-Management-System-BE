# Backend of Webhook Management System
## Description
This is the backend part of the Webhook Management System, built using Node.js and Express. It handles API requests, manages webhook subscriptions, processes incoming webhook events, and interacts with MongoDB for data persistence.

## Features
- RESTful API endpoints.
- JWT-based user authentication.
- MongoDB integration for storing data.
- Webhook event processing with retry logic.
- Error handling and validation.

## Installation

### Prerequisites
- Node.js
- MongoDB
- Redis server (for Bull queue, if used)

### Setup
1. **Clone the Repository**

  - git clone https://github.com/Rohit-raj2425/Webhook-Management-System-BE.git

2. **Install Dependencies**

  - cd backend
  - npm install

3. **Environment Variables**
## Create a `.env` file with the following contents:

- REDIS_URL=
- REDIS_PORT=
- MONGODB_URI=
- TOKEN_SECRET=

4. **Start the Backend Server**
- npm start


## Testing
- Ensure MongoDB and Redis servers are running.
- Use Postman or similar tools to test the API endpoints.

