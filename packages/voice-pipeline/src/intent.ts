import Anthropic from '@anthropic-ai/sdk';
import type { Intent } from '@clawshield/shared-types';

const SYSTEM_PROMPT = `
You are ClawShield Intent Extraction Engine. Your job is to classify the user's spoken transcript into a structured intent payload.

Return ONLY a single valid JSON object, with absolutely no markdown wrapping, no conversational text, and no greetings.
The JSON must strictly conform to this schema:
{
  "intent": string (one of: "create_task", "query_tasks", "set_reminder", "send_followup", "unknown"),
  "params": object (key-value pairs of extracted entities like dates, titles, assignees),
  "confidence": number (float between 0.0 and 1.0 indicating your confidence in the classification),
  "response_text": string (A short, human-friendly confirmation or follow-up question that the TTS engine will speak back to the user)
}

Rules for output intents:
1. create_task: Use when the user wants to add an item to their task list or project board. Params should try to include "title" and "assignee".
2. query_tasks: Use when the user asks "what do I have to do today" or "what is Jane working on".
3. set_reminder: Use when the user asks to be reminded at a specific time. Params should include "time" and "topic".
4. send_followup: Use when the user asks to email or message someone asking for an update.
5. unknown: Use if the intent completely misses the boundary of the above actions.

Example Input: "Remind me to call John tomorrow morning."
Example Output:
{
  "intent": "set_reminder",
  "params": {
    "topic": "Call John",
    "time": "tomorrow morning"
  },
  "confidence": 0.95,
  "response_text": "I'll remind you to call John tomorrow morning."
}
`;

export async function extractIntent(transcript: string): Promise<Intent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set.');
  }

  const anthropic = new Anthropic({ apiKey });

  console.log(`[Intent] Calling Claude to process transcript: "${transcript}"`);

  const msg = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: transcript }
    ],
  });

  const responseText = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
  
  try {
    const rawIntent = JSON.parse(responseText.trim());
    return rawIntent as Intent;
  } catch (err) {
    console.error(`[Intent] Failed to parse Claude JSON response: ${responseText}`);
    // Safe fallback if the model decides to break formatting
    return {
      intent: 'unknown',
      params: {},
      confidence: 0,
      response_text: "I didn't quite catch the intent. Could you try rephrasing?"
    };
  }
}
