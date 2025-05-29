import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';
import { IWebSocketServer } from '../websocket';

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
export function createWebhookRoutes(wsServer: IWebSocketServer) {
    const router = Router();
    const webhookController = new WebhookController(wsServer);
    router.post('/compilot', webhookController.handleWebhook);
    return router;
} 