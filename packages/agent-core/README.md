# @clawshield/agent-core

OpenClaw child process manager, WebSocket server, and JWT authentication layer.

## Responsibilities

- Wrap OpenClaw as a managed Node.js child process
- Restart-on-crash watchdog (max 3 retries, then alert)
- WebSocket server on `ws://localhost:4000`
- Hardware-bound JWT generation and validation
- Message protocol: `{ type, payload, sessionId, timestamp }`

## API

```ts
import { AGENT_CORE_VERSION } from '@clawshield/agent-core';
```

> Full implementation in Step 3.
