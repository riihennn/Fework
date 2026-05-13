import { Response } from "express";

/**
 * SSE (Server-Sent Events) Service
 * Manages live connections per worker, pushes real-time events to their dashboard.
 */

interface SSEClient {
  workerId: string;
  res: Response;
}

class SSEService {
  private clients: Map<string, SSEClient> = new Map();

  /**
   * Register a new SSE connection for a worker
   */
  addClient(workerId: string, clientId: string, res: Response): void {
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
  sendToWorker(workerId: string, event: string, data: unknown): void {
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
  broadcast(event: string, data: unknown): void {
    this.clients.forEach((client) => {
      if (!client.res.writableEnded) {
        client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    });
  }

  getConnectedCount(): number {
    return this.clients.size;
  }
}

// Singleton — shared across the entire app
export const sseService = new SSEService();
