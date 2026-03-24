import { Watchdog } from './watchdog.js';
import { AgentWebSocketServer } from './server.js';
import { generateDeviceJwt } from './auth.js';
import * as path from 'node:path';

/**
 * @clawshield/agent-core
 *
 * OpenClaw wrapper with child process management, restart-on-crash watchdog,
 * WebSocket server (ws://localhost:4000), and hardware-bound JWT auth.
 */

async function main() {
  console.log('🚀 Starting ClawShield Agent Core...');

  // 1. Generate JWT for the mobile dashboard to consume
  const jwt = await generateDeviceJwt();
  
  // Print highly-structured output so the CLI/Installer can capture this token and render a QR code.
  console.log('\n==================================================');
  console.log(' DEVICE JWT (Encode this in the installer QR code) ');
  console.log(` ${jwt} `);
  console.log('==================================================\n');

  // 2. Initialize Watchdog
  // Dummy command for phase 1 since real OpenClaw isn't installed
  const dummyScriptPath = path.resolve(process.cwd(), 'dummy-agent.js');
  const watchdog = new Watchdog(process.execPath, ['-e', 'console.log("Dummy agent running"); setInterval(() => {}, 1000)']);

  // 3. Initialize WebSocket Server
  const wss = new AgentWebSocketServer(4000, watchdog);

  // Bind graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    wss.stop();
    watchdog.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    wss.stop();
    watchdog.stop();
    process.exit(0);
  });

  // Start the orchestration
  watchdog.start();
  wss.start();
}

// Start
main().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

export const AGENT_CORE_VERSION = '0.1.0' as const;
