import { createServer } from './server.js';

/**
 * @clawshield/voice-pipeline
 *
 * Exposes a Fastify API on port 4001 providing STT and Intent extraction.
 */

async function main() {
  console.log('🚀 Starting Voice Pipeline...');

  const server = await createServer();
  const port = Number(process.env.VOICE_PORT) || 4001;

  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`[Voice Pipeline] Listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

export const VOICE_PIPELINE_VERSION = '0.1.0' as const;
