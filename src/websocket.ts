import { WebSocket, WebSocketServer as WS } from 'ws';
import { Server } from 'http';

/**
 * Interface defining the WebSocket server capabilities.
 * Any class implementing this interface must provide a broadcast method
 * to send messages to all connected clients.
 */
export interface IWebSocketServer {
    broadcast(data: any): void;
}

/**
 * WebSocket server implementation for real-time transaction updates.
 * This server:
 * 1. Maintains WebSocket connections with clients
 * 2. Broadcasts webhook updates to all connected clients
 * 3. Handles client connection/disconnection events
 */
export class WebSocketServer implements IWebSocketServer {
    private wss: WS;

    constructor(server: Server) {
        // Initialize WebSocket server using the existing HTTP server
        this.wss = new WS({ server });
        this.setupWebSocket();
    }

    private setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('🔌 New WebSocket client connected');
            console.log('🔌 Number of clients:', this.wss.clients.size);
            ws.on('close', () => {
                console.log('🔌 Client disconnected');
                console.log('🔌 Number of clients:', this.wss.clients.size);
            });
        });
    }

    /**
     * Broadcasts a message to all connected WebSocket clients.
     * Used to send webhook updates in real-time.
     * 
     * @param data - The data to broadcast (will be JSON stringified)
     */
    broadcast(data: any) {
        console.log('📢 Broadcasting to', this.wss.clients.size, 'clients');
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
} 