"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebhookRoutes = createWebhookRoutes;
const express_1 = require("express");
const WebhookController_1 = require("../controllers/WebhookController");
/**
 * Webhook routes for the ComPilot Transaction Monitoring System.
 * Handles incoming webhooks from ComPilot and broadcasts them via WebSocket.
 *
 * Available Routes:
 * - POST /compilot: Receive webhooks from ComPilot
 *   - Verifies webhook signatures
 *   - Broadcasts verified webhooks to connected WebSocket clients
 *
 * Note: These routes are mounted at /api/webhooks in index.ts
 * So the full path would be /api/webhooks/compilot
 *
 * @param wsServer - WebSocket server instance for broadcasting updates
 * @returns Express Router configured with webhook endpoints
 */
function createWebhookRoutes(wsServer) {
    const router = (0, express_1.Router)();
    const webhookController = new WebhookController_1.WebhookController(wsServer);
    router.post('/compilot', webhookController.handleWebhook);
    return router;
}
