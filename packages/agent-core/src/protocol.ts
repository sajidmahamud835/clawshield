import { z } from 'zod';
import type { AgentMessage, AgentMessageType } from '@clawshield/shared-types';

/**
 * Zod schema matching the AgentMessage interface.
 */
export const AgentMessageSchema = z.object({
  type: z.enum([
    'user:message',
    'agent:response',
    'agent:status',
    'agent:failed',
    'skill:invoke',
    'skill:result',
    'voice:transcript',
    'voice:audio',
  ]) as z.ZodType<AgentMessageType>,
  payload: z.record(z.string(), z.unknown()),
  sessionId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Parses and validates an incoming WebSocket payload safely.
 */
export function parseAgentMessage(rawMessage: string): AgentMessage | null {
  try {
    const parsed = AgentMessageSchema.parse(JSON.parse(rawMessage));
    return parsed;
  } catch (error) {
    console.warn('[Protocol] Failed to parse valid AgentMessage:', error);
    return null;
  }
}
