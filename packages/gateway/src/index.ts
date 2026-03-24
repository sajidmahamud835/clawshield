import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import rateLimit from '@fastify/rate-limit';
import jwt from 'jsonwebtoken';
import { AgentMessage } from '@clawshield/shared-types';
import { WebSocket } from 'ws';

const fastify = Fastify({
  logger: true,
});

// Register WebSocket support
await fastify.register(websocket);

// Register Rate Limiting
await fastify.register(rateLimit, {
  max: 30,
  timeWindow: '1 minute',
  keyGenerator: (request) => {
    // Attempt to rate-limit by sessionId from URL params for WebSocket
    const url = new URL(request.url, `http://${request.headers.host}`);
    return url.searchParams.get('sessionId') || request.ip;
  },
});

const FORBIDDEN_PHRASES = ['ignore previous', 'you are now', 'jailbreak', 'system prompt'];

/**
 * Validates hardware-bound JWT.
 */
function verifyHardwareToken(token: string): boolean {
  try {
    const secret = process.env.CLAWSHIELD_AGENT_SECRET || 'development_fallback_secret';
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/**
 * Scrubs for prompt injection attempts.
 */
function isPromptInjection(message: string): boolean {
  const lowercaseMessage = message.toLowerCase();
  return FORBIDDEN_PHRASES.some((phrase) => lowercaseMessage.includes(phrase));
}

// Health check route for Docker and Dashboard detection
fastify.get('/health', async () => {
  return { status: 'ok', version: '0.1.0' };
});

fastify.register(async (fastify) => {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token || !verifyHardwareToken(token)) {
      connection.socket.close(4001, 'Unauthorized');
      return;
    }

    // Connect to internal Agent Core (ws://agent:4000)
    const agentSocket = new WebSocket('ws://agent:4000');

    agentSocket.on('open', () => {
      console.log('[Gateway] Connected to Agent Core');
    });

    agentSocket.on('message', (data) => {
      // Forward from Agent Core to Dashboard
      connection.socket.send(data);
    });

    agentSocket.on('error', (err) => {
      console.error('[Gateway] Agent Core socket error:', err);
    });

    connection.socket.on('message', (message: Buffer) => {
      try {
        const raw = message.toString();
        const parsed: AgentMessage = JSON.parse(raw);

        // Security check: Prompt injection
        if (parsed.type === 'user:message' && typeof parsed.payload.text === 'string') {
          if (isPromptInjection(parsed.payload.text)) {
            connection.socket.send(
              JSON.stringify({
                type: 'agent:failed',
                payload: { error: 'Security Alert: Potential prompt injection detected.' },
                sessionId: parsed.sessionId,
                timestamp: new Date().toISOString(),
              }),
            );
            return;
          }
        }

        // Forward to Agent Core if connected
        if (agentSocket.readyState === WebSocket.OPEN) {
          agentSocket.send(raw);
        } else {
          console.warn('[Gateway] Agent Core socket not ready, dropping message');
        }
      } catch (err) {
        console.error('[Gateway] Failed to process message:', err);
      }
    });

    connection.socket.on('close', () => {
      agentSocket.close();
    });
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('Gateway listening on port 4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
