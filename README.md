# ClawShield

**Run OpenClaw safely. No terminal. No config files. One click.**

ClawShield is an open-source distribution that wraps OpenClaw into a production-ready, sandboxed environment with a voice-first dashboard — built for non-technical business owners who want an AI agent without touching a command line.

> Built after spending a week helping a client set up OpenClaw on a mini PC. It kept breaking. So I fixed the problem for everyone.

---

## Demo

<!-- Replace with your actual demo GIF -->
![ClawShield demo — voice note in, task created, WhatsApp reminder sent](./docs/demo.gif)

*Voice note in → task created → team gets a WhatsApp reminder. 15 seconds. No UI interaction needed.*

---

## What it does

- **Voice-controlled task management** — speak naturally, the agent understands and acts
- **Automatic team reminders** — sends WhatsApp or Telegram follow-ups on schedule
- **Zero terminal required** — everything managed through a clean web dashboard
- **Sandboxed and safe** — the AI agent runs in Docker and cannot access your OS or files

---

## Install

### Linux / Mac
```bash
curl -sSL https://clawshield.io/install | bash
```

### Windows (PowerShell)
```powershell
irm https://clawshield.io/install.ps1 | iex
```

### Manual (Docker)
```bash
git clone https://github.com/yourusername/clawshield
cd clawshield
cp .env.example .env.local
# Add your API keys to .env.local
docker-compose up -d
# Open http://localhost:3000
```

**Requirements:** Docker Desktop (Windows/Mac) or Docker Engine (Linux). The installer handles everything else.

---

## Quick start

1. Run the installer above
2. Open `http://localhost:3000` in your browser
3. Follow the 4-step setup wizard:
   - Connect your agent
   - Add your API keys (Anthropic + ElevenLabs)
   - Test voice input
   - Go live
4. Scan the QR code to control your agent from your phone

That's it. No `.env` editing, no terminal commands, no Docker knowledge needed.

---

## Architecture

ClawShield is a tri-layer system:

```
┌─────────────────────────────────────────────┐
│  Dashboard  (Next.js · localhost:3000)       │
│  Voice UI · Skill Store · Live Agent Trace  │
└─────────────────┬───────────────────────────┘
                  │ WebSocket (JWT auth)
┌─────────────────▼───────────────────────────┐
│  Gateway  (Fastify · localhost:4000)         │
│  Prompt injection filter · Rate limiter      │
└─────────────────┬───────────────────────────┘
                  │ Internal Docker network
┌─────────────────▼───────────────────────────┐
│  Agent  (OpenClaw · Alpine Linux container)  │
│  No host filesystem access · Non-root user   │
└─────────────────────────────────────────────┘
```

**Voice pipeline:**
```
Voice note → Whisper STT → Claude (intent extraction) → OpenClaw → SQLite task store → WhatsApp/Telegram reminder
```

**Security model:**
- Agent container has zero access to your host OS
- All incoming messages are filtered for prompt injection
- API keys are encrypted in your browser using a hardware-bound token — never sent to any external server
- Rate limited: 30 messages/minute per session

---

## Features

| Feature | Status |
|---|---|
| 1-click installer (Linux/Mac/Windows) | ✅ Done |
| Docker sandboxed agent | ✅ Done |
| Next.js dashboard (no terminal needed) | ✅ Done |
| Voice input via Whisper | ✅ Done |
| Task creation + querying by voice | ✅ Done |
| Automatic WhatsApp reminders | ✅ Done |
| Telegram notifications | ✅ Done |
| Skill store (1-click skill install) | ✅ Done |
| QR code mobile access | ✅ Done |
| Live agent reasoning trace | 🔄 In progress |
| Tauri desktop app (Windows/Mac) | 🔄 In progress |
| ClawCloud hosted version | 📋 Planned |
| Skill marketplace | 📋 Planned |
| Multi-user / team support | 📋 Planned |

---

## Starter skills

Three skills ship out of the box:

**Task Manager** *(always installed)*
Creates, queries, and updates tasks by voice. Schedules reminders automatically.

**WhatsApp Notifier**
Sends task reminders and follow-ups to your team via WhatsApp. Requires a WhatsApp account linked on first setup.

**Web Researcher**
Searches the web and summarises results on command. Requires explicit browser permission grant — you see exactly what it can access.

More skills coming. Want to build one? See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```env
# Required
ANTHROPIC_API_KEY=          # claude.ai API key
OPENAI_API_KEY=             # for Whisper STT fallback

# Voice output (optional)
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

# Notifications (pick one)
NOTIFY_CHANNEL=whatsapp     # or: telegram
TELEGRAM_BOT_TOKEN=         # if using telegram
WHATSAPP_SESSION_PATH=./data/whatsapp-session
```

The setup wizard in the dashboard handles this for you — no manual file editing needed.

---

## Monorepo structure

```
clawshield/
├── apps/
│   ├── desktop/          # Tauri desktop app (installer/launcher)
│   └── dashboard/        # Next.js 15 control panel
├── packages/
│   ├── agent-core/       # OpenClaw wrapper + WebSocket server
│   ├── voice-pipeline/   # Whisper STT + ElevenLabs TTS
│   ├── skill-runner/     # Sandboxed Docker skill executor
│   └── shared-types/     # TypeScript types
├── docker/
│   └── docker-compose.yml
└── scripts/
    ├── install.sh
    └── install.ps1
```

---

## Why ClawShield over raw OpenClaw?

| | Raw OpenClaw | ClawShield |
|---|---|---|
| Setup | Terminal + manual config | One command or click |
| Security | Full OS access | Sandboxed container |
| Interface | WhatsApp commands only | Full web dashboard |
| Voice | Manual integration | Built-in, toggle on/off |
| Reliability | Crashes stay crashed | Auto-restart watchdog |
| Non-tech users | Nearly impossible | Designed for them |

---

## Contributing

PRs welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

To build a new skill, see [docs/building-skills.md](./docs/building-skills.md). Skills are isolated Node.js packages with a standardised `SKILL.md` manifest — no core changes needed.

---

## Self-hosted vs ClawCloud

ClawShield is fully self-hostable and always will be. The open-source version will never be crippled.

**ClawCloud** (coming soon) is a paid hosted option for users who don't want to manage their own server. Same codebase, managed infrastructure, $29/month. [Join the waitlist →](https://clawshield.io/cloud)

---

## License

MIT — see [LICENSE](./LICENSE)

---

## Support

- GitHub Issues for bugs and feature requests
- [Discord](https://discord.gg/clawshield) for questions and community
- [clawshield.io](https://clawshield.io) for docs and hosted version

---

*Made in Dhaka. Built because setting up AI agents shouldn't require a computer science degree.*
