"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const transactionTracker_1 = require("../services/transactionTracker");
/**
 * Controller handling ComPilot webhook events.
 * This controller:
 * 1. Receives webhook events from ComPilot
 * 2. Verifies webhook signatures using SVIX
 * 3. Broadcasts verified events to connected WebSocket clients
 *
 * Required environment variables:
 * - WEBHOOK_SECRET: The webhook signing secret from ComPilot
 */
class WebhookController {
    constructor(wsServer) {
        this.wsServer = wsServer;
        /**
         * Handles incoming webhook requests.
         * 1. Logs the received webhook
         * 2. Verifies the webhook signature
         * 3. Broadcasts the webhook data to all connected clients
         *
         * Expected webhook format:
         * {
         *   type: string,      // e.g., 'transaction.updated'
         *   payload: {
         *     transactionId: string,
         *     status: string,
         *     ...other fields
         *   }
         * }
         */
        this.handleWebhook = (req, res) => {
            try {
                console.log('📥 Webhook received:', {
                    type: req.body.type,
                    payload: req.body.payload,
                    headers: req.headers
                });
                if (!this.verifySignature(req.body, req.headers)) {
                    res.status(401).json({ error: 'Invalid signature' });
                    return;
                }
                // Check if this webhook corresponds to a pending transaction
                const transactionId = req.body.payload?.transactionId;
                if (transactionId) {
                    // Attempt to resolve any pending transaction waiting for this webhook
                    transactionTracker_1.TransactionTracker.resolveWebhook(transactionId, req.body);
                }
                // Broadcast to all connected clients
                console.log('📤 Broadcasting webhook:', req.body);
                this.wsServer.broadcast(req.body);
                res.json({ received: true });
            }
            catch (error) {
                console.error('❌ Webhook error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.webhookSecret = process.env.WEBHOOK_SECRET || '';
    }
    /**
     * Verifies the authenticity of incoming webhooks using SVIX signatures.
     *
     * @param payload - The webhook payload to verify
     * @param headers - The request headers containing SVIX signature details
     * @returns boolean - Whether the signature is valid
     */
    verifySignature(payload, headers) {
        try {
            if (!this.webhookSecret) {
                return true; // Skip verification if no secret is configured
            }
            const svixId = headers['svix-id'];
            const svixTimestamp = headers['svix-timestamp'];
            const svixSignature = headers['svix-signature'];
            if (!svixId || !svixTimestamp || !svixSignature) {
                return false;
            }
            const message = Buffer.from(`${svixId}.${svixTimestamp}.${JSON.stringify(payload)}`);
            const secretKey = this.webhookSecret.replace('whsec_', '');
            const secretBytes = Buffer.from(secretKey, 'base64');
            const computedSignature = crypto_1.default
                .createHmac('sha256', secretBytes)
                .update(message)
                .digest('base64');
            const expectedSignature = svixSignature.split(',')[1];
            return crypto_1.default.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(expectedSignature));
        }
        catch (error) {
            console.error('❌ Signature verification failed:', error);
            return false;
        }
    }
}
exports.WebhookController = WebhookController;
