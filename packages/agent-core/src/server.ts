import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'node:http';
import { verifyToken } from './auth.js';
import { parseAgentMessage } from './protocol.js';
import type { Watchdog } from './watchdog.js';
import { PrismaClient } from '@prisma/client';

export class AgentWebSocketServer {
  private wss: WebSocketServer;
  private clients = new Set<WebSocket>();
  private prisma: PrismaClient;

  constructor(
    private port: number,
    private watchdog: Watchdog,
  ) {
    this.wss = new WebSocketServer({ port: this.port, clientTracking: true }, () => {
      console.log(`[WSS] Server listening on ws://localhost:${this.port}`);
    });
    this.prisma = new PrismaClient();
  }

  public start(): void {
    this.wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
      // 1. Authenticate via query param or header (for WS)
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token || !(await verifyToken(token))) {
        console.warn(`[WSS] Rejected connection from ${req.socket.remoteAddress} (Invalid Token)`);
        ws.close(4001, 'Unauthorized');
        return;
      }

      console.log(`[WSS] Authenticated client connected from ${req.socket.remoteAddress}`);
      this.clients.add(ws);

      ws.on('message', async (data: Buffer) => {
        const message = parseAgentMessage(data.toString());
        if (!message) {
          ws.send(JSON.stringify({ error: 'Invalid message schema' }));
          return;
        }

        console.log(`[WSS] Recv [${message.type}]: handling command`);

        // Handle task persistence messages
        if (message.type === 'user:message' && (message.payload as any).intent === 'create_task') {
          const params = (message.payload as any).params;
          const task = await this.prisma.task.create({
            data: {
              title: params.title || 'Untitled Task',
              assignee: params.assignee,
              status: 'pending',
              priority: 'medium',
            },
          });
          ws.send(
            JSON.stringify({
              type: 'agent:response',
              payload: {
                text: `Task created: ${task.title} (ID: ${task.id})`,
                task,
              },
              sessionId: message.sessionId,
              timestamp: new Date().toISOString(),
            }),
          );
        } else if (
          message.type === 'user:message' &&
          (message.payload as any).intent === 'query_tasks'
        ) {
          const tasks = await this.prisma.task.findMany();
          ws.send(
            JSON.stringify({
              type: 'agent:response',
              payload: {
                text: `You have ${tasks.length} tasks.`,
                tasks,
              },
              sessionId: message.sessionId,
              timestamp: new Date().toISOString(),
            }),
          );
        }

        // Forward valid JSON commands to the agent process
        this.watchdog.writeToAgent(JSON.stringify(message));
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WSS] Client disconnected.`);
      });

      ws.on('error', (err) => {
        console.error(`[WSS] Socket error:`, err);
      });
    });

    // Pipe agent stdout messages back to all connected WS clients
    this.watchdog.on('stdout', (data: string) => {
      try {
        // Only forward valid JSON. Raw text logs are printed to terminal.
        const parsed = JSON.parse(data);
        if (parsed.type) {
          this.broadcast(JSON.stringify(parsed));
        }
      } catch {
        // Non-JSON output from agent is ignored for WebSocket
      }
    });
  }

  public broadcast(payload: string): void {
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  public stop(): void {
    this.wss.close();
  }
}
