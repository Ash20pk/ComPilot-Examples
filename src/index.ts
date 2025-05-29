import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from './websocket';
import { createWebhookRoutes } from './routes/webhookRoutes';
import { transactionRoutes } from './routes/transactions';
import { WebhookController } from './controllers/WebhookController';

/**
 * ComPilot Transaction Monitoring System - TypescriptBackend Server
 * 
 * This server provides:
 * 1. REST API endpoints for transaction submission
 * 2. Webhook endpoints for receiving ComPilot updates
 * 3. WebSocket server for real-time updates to clients
 * 
 * Required environment variables:
 * - PORT: Server port (default: 8080)
 * - WEBHOOK_SECRET: ComPilot webhook signing secret
 * - COMPILOT_API_URL: ComPilot API base URL
 * - COMPILOT_API_KEY: ComPilot API key
 */

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server (required for WebSocket support)
const server = createServer(app);

// Initialize WebSocket server for real-time updates
const wsServer = new WebSocketServer(server);

// Set up routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/webhooks', createWebhookRoutes(wsServer));

// Root webhook endpoint for ngrok testing
app.post('/', (req, res) => {
    const webhookController = new WebhookController(wsServer);
    return webhookController.handleWebhook(req, res);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
}); 