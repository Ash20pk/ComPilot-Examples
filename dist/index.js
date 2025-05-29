"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const websocket_1 = require("./websocket");
const webhookRoutes_1 = require("./routes/webhookRoutes");
const transactions_1 = require("./routes/transactions");
const WebhookController_1 = require("./controllers/WebhookController");
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
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Create HTTP server (required for WebSocket support)
const server = (0, http_1.createServer)(app);
// Initialize WebSocket server for real-time updates
const wsServer = new websocket_1.WebSocketServer(server);
// Set up routes
app.use('/api/transactions', transactions_1.transactionRoutes);
app.use('/api/webhooks', (0, webhookRoutes_1.createWebhookRoutes)(wsServer));
// Root webhook endpoint for ngrok testing
app.post('/', (req, res) => {
    const webhookController = new WebhookController_1.WebhookController(wsServer);
    return webhookController.handleWebhook(req, res);
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
