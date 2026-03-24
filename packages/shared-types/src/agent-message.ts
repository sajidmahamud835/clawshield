/**
 * Types of messages that flow between agent, gateway, and dashboard.
 */
export type AgentMessageType =
  | 'user:message'
  | 'agent:response'
  | 'agent:status'
  | 'agent:failed'
  | 'skill:invoke'
  | 'skill:result'
  | 'voice:transcript'
  | 'voice:audio';

/**
 * Core message envelope for all WebSocket communication.
 */
export interface AgentMessage {
  /** Discriminator for message routing */
  readonly type: AgentMessageType;
  /** Message-specific data */
  readonly payload: Record<string, unknown>;
  /** Session identifier for client tracking */
  readonly sessionId: string;
  /** ISO-8601 timestamp */
  readonly timestamp: string;
}
