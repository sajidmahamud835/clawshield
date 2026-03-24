import WebSocket from 'ws';
import subprocess from 'node:child_process';

async function test() {
  const logContent = subprocess.execSync('tail -n 100 ../../agent-core.log').toString();
  const jwtMatch = logContent.match(
    / (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+) /,
  );

  if (!jwtMatch) {
    console.error('Could not find JWT in agent-core.log');
    process.exit(1);
  }

  const jwt = jwtMatch[1];
  const ws = new WebSocket(`ws://localhost:4000?token=${jwt}`);

  ws.on('open', () => {
    console.log('Connected to Agent WebSocket');

    // Create task
    ws.send(
      JSON.stringify({
        type: 'user:message',
        payload: {
          intent: 'create_task',
          params: { title: 'Test Task from Script' },
        },
        sessionId: 'test-script',
        timestamp: new Date().toISOString(),
      }),
    );
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    console.log('Received:', msg);

    if (msg.payload?.task?.title === 'Test Task from Script') {
      console.log('✅ Task creation verified!');

      // Query tasks
      ws.send(
        JSON.stringify({
          type: 'user:message',
          payload: { intent: 'query_tasks' },
          sessionId: 'test-script',
          timestamp: new Date().toISOString(),
        }),
      );
    } else if (msg.payload?.tasks) {
      console.log(`✅ Task query verified! Found ${msg.payload.tasks.length} tasks.`);
      ws.close();
      process.exit(0);
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket Error:', err);
    process.exit(1);
  });

  setTimeout(() => {
    console.error('Timed out waiting for verification');
    process.exit(1);
  }, 10000);
}

test();
