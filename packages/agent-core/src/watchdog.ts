import { spawn, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';

export class Watchdog extends EventEmitter {
  private child: ChildProcess | null = null;
  private restartCount = 0;
  private maxRestarts = 3;
  private restartWindowMs = 60000; // 1 minute window
  private firstCrashTime = 0;
  private isIntentionalExit = false;

  constructor(private command: string, private args: string[] = []) {
    super();
  }

  public start(): void {
    this.isIntentionalExit = false;
    this.spawnChild();
  }

  public stop(): void {
    this.isIntentionalExit = true;
    if (this.child) {
      this.child.kill('SIGTERM');
      this.child = null;
    }
  }

  private spawnChild(): void {
    console.log(`[Watchdog] Spawning agent process: ${this.command} ${this.args.join(' ')}`);
    
    this.child = spawn(this.command, this.args, {
      stdio: 'pipe',
      env: process.env,
    });

    this.child.stdout?.on('data', (data) => {
      // Forward agent output, could optionally pipe to dashboard
      process.stdout.write(`[Agent] ${data}`);
      this.emit('stdout', data.toString());
    });

    this.child.stderr?.on('data', (data) => {
      process.stderr.write(`[Agent ERR] ${data}`);
      this.emit('stderr', data.toString());
    });

    this.child.on('exit', (code, signal) => {
      console.log(`[Watchdog] Agent exited with code ${code} and signal ${signal}`);
      this.child = null;
      
      if (!this.isIntentionalExit) {
        this.handleCrash();
      }
    });
  }

  private handleCrash(): void {
    const now = Date.now();
    
    // Reset window if it's been a while since the first crash
    if (now - this.firstCrashTime > this.restartWindowMs) {
      this.restartCount = 0;
      this.firstCrashTime = now;
    }

    this.restartCount++;

    if (this.restartCount > this.maxRestarts) {
      console.error(`[Watchdog] FATAL: Agent crashed ${this.restartCount} times within limit. Giving up.`);
      this.emit('fatal');
      return;
    }

    console.log(`[Watchdog] Restarting agent (attempt ${this.restartCount}/${this.maxRestarts})...`);
    setTimeout(() => this.spawnChild(), 1000); // 1 second backoff
  }

  public writeToAgent(data: string): void {
    if (this.child && this.child.stdin) {
      this.child.stdin.write(data + '\n');
    }
  }
}
