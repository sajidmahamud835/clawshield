# @clawshield/voice-pipeline

Speech-to-text, text-to-speech, and intent extraction pipeline.

## Endpoints

| Endpoint      | Method | Description                             |
| ------------- | ------ | --------------------------------------- |
| `/transcribe` | POST   | STT via Whisper (local or API fallback) |
| `/speak`      | POST   | TTS via ElevenLabs Turbo v2.5           |

## Intent Extraction

Uses Claude claude-sonnet-4-6 to classify transcripts into structured intents:
`create_task`, `query_tasks`, `set_reminder`, `send_followup`, `unknown`

## Environment Variables

| Variable             | Description                  |
| -------------------- | ---------------------------- |
| `WHISPER_MODE`       | `local` or `api`             |
| `OPENAI_API_KEY`     | For Whisper API fallback     |
| `ELEVENLABS_API_KEY` | For TTS                      |
| `ANTHROPIC_API_KEY`  | For Claude intent extraction |

> Full implementation in Step 4.
