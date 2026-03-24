# @clawshield/dashboard

Next.js 15 App Router — local control panel served on `localhost:3000`.

## Pages

| Route | Description |
|-------|-------------|
| `/setup` | First-run wizard (connect agent → API keys → test voice → done) |
| `/dashboard` | Main view: tasks, activity, agent status |
| `/skills` | Skill store: install/uninstall skills |
| `/voice` | Voice test: record, transcript, response |
| `/settings` | API keys, notifications, agent config |

## Tech Stack

- Next.js 15 (App Router)
- Shadcn/UI + Tailwind CSS
- WebSocket connection to agent-core

> Full implementation in Step 5.
