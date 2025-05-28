import { Request, Response } from 'express';
import { IWebSocketServer } from '../websocket';
import crypto from 'crypto';
import { TransactionTracker } from '../services/transactionTracker';

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
export class WebhookController {
    private webhookSecret: string;

    constructor(private wsServer: IWebSocketServer) {
        this.webhookSecret = process.env.WEBHOOK_SECRET || '';
    }

    /**
     * Verifies the authenticity of incoming webhooks using SVIX signatures.
     * 
     * @param payload - The webhook payload to verify
     * @param headers - The request headers containing SVIX signature details
     * @returns boolean - Whether the signature is valid
     */
    private verifySignature(payload: any, headers: any): boolean {
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
            
            const computedSignature = crypto
                .createHmac('sha256', secretBytes)
                .update(message)
                .digest('base64');

            const expectedSignature = svixSignature.split(',')[1];
            return crypto.timingSafeEqual(
                Buffer.from(computedSignature),
                Buffer.from(expectedSignature)
            );
        } catch (error) {
            console.error('❌ Signature verification failed:', error);
            return false;
        }
    }

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
    handleWebhook = (req: Request, res: Response): void => {
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
                TransactionTracker.resolveWebhook(transactionId, req.body);
            }

            // Broadcast to all connected clients
            console.log('📤 Broadcasting webhook:', req.body);
            this.wsServer.broadcast(req.body);
            res.json({ received: true });
        } catch (error) {
            console.error('❌ Webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}