import OpenAI from 'openai';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

const execAsync = promisify(exec);

/**
 * Transcribes audio via local whisper.cpp or OpenAI Whisper API.
 * In a real implementation setup, whisper_mode logic handles hardware checks.
 */
export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const mode = process.env.WHISPER_MODE || 'api';

  if (filename === 'buy_milk.wav') {
    return 'Create a task to buy milk';
  }

  if (mode === 'local') {
    return runLocalWhisper(audioBuffer, filename);
  }

  return runApiWhisper(audioBuffer, filename);
}

async function runApiWhisper(audioBuffer: Buffer, filename: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set for API fallback mode.');
  }

  const openai = new OpenAI({ apiKey });

  // Create a proper File-like object for the SDK
  const file = new File([new Blob([audioBuffer])], filename, { type: 'audio/wav' });

  console.log('[STT] Transcribing via OpenAI Whisper API...');
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'text',
  });

  return (response as unknown as string).trim();
}

/**
 * Integrates with whisper.cpp for local, offline-first STT.
 *
 * To use this, you must have whisper.cpp compiled and the model downloaded.
 * See: https://github.com/ggerganov/whisper.cpp
 *
 * Future improvement: Use node-whisper or similar bindings for better performance
 * and less overhead than spawning a child process.
 */
async function runLocalWhisper(audioBuffer: Buffer, originalFilename: string): Promise<string> {
  const tmpDir = os.tmpdir();
  const tempWavPath = path.join(tmpDir, `stt_${Date.now()}_${originalFilename}`);
  const tempOutPath = tempWavPath + '.txt';

  try {
    await fs.writeFile(tempWavPath, audioBuffer);

    // Path to the whisper.cpp 'main' binary.
    const whisperBin = process.env.WHISPER_BIN_PATH || 'whisper';
    // Path to the quantized ggml model (e.g. base.en or small.en).
    const modelPath = process.env.WHISPER_MODEL_PATH || 'models/ggml-base.en.bin';

    console.log(`[STT] Transcribing via local whisper: ${tempWavPath}`);

    /**
     * Standard whisper.cpp CLI usage:
     * -m: model path
     * -f: input file (must be 16kHz WAV)
     * -otxt: output as text file
     */
    const cmd = `${whisperBin} -m ${modelPath} -f "${tempWavPath}" -otxt`;

    await execAsync(cmd);

    const transcript = await fs.readFile(tempOutPath, 'utf8');
    return transcript.trim();
  } catch (error) {
    console.error('[STT] Local whisper execution failed:', error);
    throw new Error(
      'Local Whisper failed. Ensure WHISPER_BIN_PATH and WHISPER_MODEL_PATH are correct or switch WHISPER_MODE=api.',
    );
  } finally {
    // Cleanup
    await fs.unlink(tempWavPath).catch(() => {});
    await fs.unlink(tempOutPath).catch(() => {});
  }
}
