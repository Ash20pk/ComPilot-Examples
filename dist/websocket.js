"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = void 0;
const ws_1 = require("ws");
/**
 * WebSocket server implementation for real-time transaction updates.
 * This server:
 * 1. Maintains WebSocket connections with clients
 * 2. Broadcasts webhook updates to all connected clients
 * 3. Handles client connection/disconnection events
 */
class WebSocketServer {
    constructor(server) {
        // Initialize WebSocket server using the existing HTTP server
        this.wss = new ws_1.WebSocketServer({ server });
        this.setupWebSocket();
    }
    setupWebSocket() {
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
    broadcast(data) {
        console.log('📢 Broadcasting to', this.wss.clients.size, 'clients');
        this.wss.clients.forEach(client => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}
exports.WebSocketServer = WebSocketServer;
