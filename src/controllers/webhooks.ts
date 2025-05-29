import { Request, Response } from 'express';
import { IWebSocketServer } from '../websocket';

export class WebhookController {
    constructor(private wsServer: IWebSocketServer) {}

    handleWebhook = async (req: Request, res: Response) => {
        try {
            console.log('📥 Webhook received:', req.body);
            
            // Broadcast to all connected clients
            this.wsServer.broadcast(req.body);
            
            res.json({ received: true });
        } catch (error) {
            console.error('❌ Webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
} 