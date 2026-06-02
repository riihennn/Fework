"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sseService = void 0;
class SSEService {
    constructor() {
        this.clients = new Map();
    }
    /**
     * Register a new SSE connection for a worker
     */
    addClient(workerId, clientId, res) {
        // Set SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:3000");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.flushHeaders();
        // Send a ping to confirm connection
        res.write(`event: connected\ndata: ${JSON.stringify({ message: "SSE connected", workerId })}\n\n`);
        this.clients.set(clientId, { workerId, res });
        // Heartbeat every 25s to keep connection alive
        const heartbeat = setInterval(() => {
            if (res.writableEnded) {
                clearInterval(heartbeat);
                return;
            }
            res.write(`:heartbeat\n\n`);
        }, 25000);
        // Cleanup on disconnect
        res.on("close", () => {
            clearInterval(heartbeat);
            this.clients.delete(clientId);
            console.log(`SSE client disconnected: ${clientId}`);
        });
    }
    /**
     * Push an event to all SSE connections belonging to a specific worker
     */
    sendToWorker(workerId, event, data) {
        let sent = 0;
        this.clients.forEach((client, clientId) => {
            if (client.workerId === workerId && !client.res.writableEnded) {
                client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
                sent++;
            }
        });
        console.log(`[SSE] Pushed "${event}" to worker ${workerId} (${sent} connections)`);
    }
    /**
     * Broadcast to ALL connected workers (e.g. admin announcements)
     */
    broadcast(event, data) {
        this.clients.forEach((client) => {
            if (!client.res.writableEnded) {
                client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            }
        });
    }
    getConnectedCount() {
        return this.clients.size;
    }
}
// Singleton — shared across the entire app
exports.sseService = new SSEService();
//# sourceMappingURL=sse.service.js.map