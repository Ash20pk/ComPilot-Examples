"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
class WebhookController {
    constructor(wsServer) {
        this.wsServer = wsServer;
        this.handleWebhook = async (req, res) => {
            try {
                console.log('📥 Webhook received:', req.body);
                // Broadcast to all connected clients
                this.wsServer.broadcast(req.body);
                res.json({ received: true });
            }
            catch (error) {
                console.error('❌ Webhook error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
    }
}
exports.WebhookController = WebhookController;
