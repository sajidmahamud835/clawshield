#!/bin/bash
# ClawShield Linux/macOS Installer

set -e

echo "🚀 Starting ClawShield Setup..."

# 1. Checks
if ! [ -x "$(command -v node)" ]; then
  echo "❌ Error: Node.js is not installed." >&2
  exit 1
fi

# 2. Workspace Init
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# 3. Env Setup
if [ ! -f .env.local ]; then
  echo "📝 Initializing .env.local..."
  cp .env.local.example .env.local
  SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  sed -i "s/CLAWSHIELD_AGENT_SECRET=.*/CLAWSHIELD_AGENT_SECRET=$SECRET/" .env.local
fi

echo "✅ ClawShield is ready!"
echo "Run './scripts/start.sh' to boot."
