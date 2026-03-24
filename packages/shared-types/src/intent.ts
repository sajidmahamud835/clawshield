/**
 * Parsed intent from natural language input.
 * Produced by the agent's NLU pipeline.
 */
export interface Intent {
  /** The classified intent name (e.g. "create_task", "search_web") */
  readonly intent: string;
  /** Extracted parameters from the user's message */
  readonly params: Record<string, unknown>;
  /** Confidence score from 0.0 to 1.0 */
  readonly confidence: number;
  /** Human-readable response text to send back */
  readonly response_text: string;
}
