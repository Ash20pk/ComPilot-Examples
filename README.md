ComPilot Transaction Monitoring Example - Backend TypeScript
========================================================

This example demonstrates how to build a backend server that handles transaction submissions and status updates using ComPilot's API. It includes real-time updates via WebSocket and webhook processing.

## Features

- Express.js REST API for transaction submission
- WebSocket server for real-time status updates
- Webhook handler with SVIX signature verification
- Support for both Crypto and Fiat transactions
- Transaction status tracking and broadcasting

## Prerequisites

- Access to ComPilot dashboard with an API key
- A transaction monitoring workflow set up in your workspace
- Node.js and npm/yarn installed
- ngrok for webhook testing

## Project Structure

```
src/
├── controllers/
│   ├── WebhookController.ts    # Webhook handling and verification
│   └── transactions.ts         # Transaction submission
├── services/
│   └── compilot.ts            # ComPilot API integration
├── routes/
│   ├── transactions.ts        # Transaction routes
│   └── webhookRoutes.ts       # Webhook routes
├── websocket/
│   └── index.ts              # WebSocket server implementation
└── types/
    └── transaction.ts        # Type definitions
```

## Getting Started

1. Install dependencies:
```bash
yarn install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
# API Configuration
COMPILOT_API_URL=https://api.compilot.ai
COMPILOT_API_KEY=your_api_key

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_URL=https://[your-ngrok-url]/api/webhooks/compilot

# Workflow ID
COMPILOT_TMS_WORKFLOW_ID=your_workflow_id

# Server Configuration
PORT=8080
NODE_ENV=development
```

4. Start ngrok tunnel:
```bash
ngrok http 8080
```

5. Update the WEBHOOK_URL in `.env` with your ngrok URL

6. Start the server:
```bash
yarn dev
```

## API Endpoints

### Transaction Submission
```http
POST /api/workflows/:workflowId/transactions
Content-Type: application/json

{
  "transactionType": "crypto",
  "transactionSubType": "wallet transfer",
  "transactionInfo": {
    "direction": "IN",
    "amount": 0.5,
    "currencyCode": "ETH"
  }
  // ... see transaction.ts for full schema
}
```

### Webhook Endpoint
```http
POST /api/webhooks/compilot
```
Handles ComPilot webhook events with SVIX signature verification.

### WebSocket
```
WS /ws
```
Provides real-time transaction status updates to connected clients.

## Documentation

- [ComPilot Documentation](https://docs.compilot.ai)
- [API Reference](https://docs.compilot.ai/apis/)

## Related

- [Frontend Implementation](../frontend)
- [Backend Python Implementation](../backend-python) 