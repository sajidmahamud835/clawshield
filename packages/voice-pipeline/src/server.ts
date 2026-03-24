import fastify from 'fastify';
import multipart from '@fastify/multipart';
import { transcribeAudio } from './stt.js';
import { extractIntent } from './intent.js';

export async function createServer() {
  const app = fastify({ logger: true });

  // Register multipart to accept audio file uploads
  await app.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024, // 25MB max file size matching typical Whisper limits
    }
  });

  app.post('/transcribe', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No audio file provided in form data' });
      }

      const buffer = await data.toBuffer();
      const filename = data.filename || 'recording.wav';

      // 1. STT: Whisper
      app.log.info(`Processing STT for ${filename} (${buffer.length} bytes)`);
      const transcript = await transcribeAudio(buffer, filename);
      
      // 2. NLU: Intent Extraction
      app.log.info(`Extracting intent for transcript length: ${transcript.length}`);
      const intent = await extractIntent(transcript);

      return {
        transcript,
        intent
      };

    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ error: error.message || 'STT/Intent pipeline failed' });
    }
  });

  return app;
}
