# @clawshield/shared-types

TypeScript type definitions shared across all ClawShield packages and apps.

## Exported Types

| Type | File | Description |
|------|------|-------------|
| `AgentMessage` | `agent-message.ts` | WebSocket message envelope |
| `AgentMessageType` | `agent-message.ts` | Discriminated union of message types |
| `Intent` | `intent.ts` | NLU intent extraction result |
| `Task` | `task.ts` | Task entity managed by the agent |
| `TaskStatus` | `task.ts` | Task lifecycle states |
| `TaskPriority` | `task.ts` | Priority levels |
| `Skill` | `skill.ts` | Sandboxed Docker skill descriptor |

## Usage

```ts
import type { AgentMessage, Task } from '@clawshield/shared-types';
```
