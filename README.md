# ClawShield

**ClawShield** is an open-source, zero-terminal distribution of the OpenClaw AI engine, purposefully designed for non-technical business owners. It provides a complete sandbox, voice-controlled task management, and one-click deployment architecture.

## Overview

Unlike standard developer agent frameworks, ClawShield aims to be entirely operable without touching a command line after the first setup. A business owner clicks the installer, scans a QR code, and their personal AI agent is live and securely manageable from their phone.

### Core Features

- **Zero-Terminal Experience:** Local React dashboard (Next.js) for simple GUI management.
- **Hardware-bound Security:** Agents pair via a machine-unique JWT displayed via QR code on first startup. NO reliance on cloud servers for the core pairing loop.
- **Isolated Docker Orchestration:** Agents and skills operate in isolated `clawshield-internal` Docker bridge networks. The agent container cannot reach the host OS natively.
- **Voice-Native Operations:** Integrated `voice-pipeline` combining STT (Whisper API or `whisper.cpp` locally) and Intent Extraction (Anthropic Claude).
- **Extensible Skill Sandboxing:** (Upcoming) Third-party skills execute in ephemeral Docker containers restricting unauthorized network or filesystem access.

---

## Architecture / Monorepo Layout

This repository uses **pnpm workspaces** to manage multiple independent operational packages:

```text
clawshield/
├── apps/
│   ├── dashboard/        # Next.js 15 App Router — Local browser console
│   ├── desktop/          # Tauri 2.0 app — Installer and launcher wrapper
│   └── cloud/            # Next.js 15 — Future SaaS portal
├── packages/
│   ├── agent-core/       # Node.js wrapper for OpenClaw. Contains Watchdog + WS Server + JWT Auth.
│   ├── voice-pipeline/   # Fastify service for /transcribe and Claude Intent Extraction.
│   ├── skill-runner/     # Sandboxed Docker skill executor logic.
│   └── shared-types/     # Common TypeScript definitions (Tasks, Intents, Skills).
├── docker/               # Docker Compose environments and service Dockerfiles
└── scripts/              # One-click installers (bash & PowerShell)
```

---

## Development Setup

### Prerequisites
1. **Node.js 20+**
2. **pnpm 9+**
3. **Docker Desktop** (Windows/Mac) or Docker CE (Linux)
4. Active API Keys for Anthropic and OpenAI (if not using local whisper). 

### Installation

1. Copy the environment configuration:
   ```bash
   cp .env.local.example .env.local
   ```
   *Fill out the `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` manually inside `.env.local`.*

2. Install dependencies globally across the workspace:
   ```bash
   npm install
   ```

3. Type-check the monorepo to verify structural integrity:
   ```bash
   npm run typecheck
   # Equivalently: npx tsc -b packages/*/tsconfig.json
   ```

### Running Services Internally (Dev Mode)

To run the agent-core and voice-pipeline manually (outside Docker):

```bash
# Terminal 1: Boot Voice Pipeline
pnpm --filter @clawshield/voice-pipeline dev

# Terminal 2: Boot Agent Core Supervisor
pnpm --filter @clawshield/agent-core dev
```

---

## License

MIT License. OpenClaw and ClawShield are open-source.
