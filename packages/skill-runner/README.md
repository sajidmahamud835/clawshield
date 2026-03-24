# @clawshield/skill-runner

Sandboxed Docker skill executor for ClawShield.

## Responsibilities

- Launch skill containers with restricted permissions
- Enforce filesystem and network isolation
- Manage skill lifecycle (install, start, stop, uninstall)
- Communicate results back to agent-core via IPC

## API

```ts
import { SKILL_RUNNER_VERSION } from '@clawshield/skill-runner';
```

> Full implementation in later phase.
