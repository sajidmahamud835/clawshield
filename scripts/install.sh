#!/bin/bash
# ClawShield Linux/macOS Installer

set -e

echo "🚀 Starting ClawShield Setup..."

# 1. Checks: Docker
if ! [ -x "$(command -v docker)" ]; then
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📦 Installing Docker via get.docker.com..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "❌ Error: Docker not found. Please install Docker Desktop for Mac."
    exit 1
  fi
fi

# 2. Checks: Docker Compose
if ! docker compose version &> /dev/null; then
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📦 Installing Docker Compose plugin..."
    if [ -x "$(command -v apt-get)" ]; then
      sudo apt-get update && sudo apt-get install -y docker-compose-plugin
    else
      echo "❌ Error: Could not install Docker Compose automatically. Please install it manually."
      exit 1
    fi
  else
    echo "❌ Error: Docker Compose not found. Please ensure it is installed with Docker Desktop."
    exit 1
  fi
fi

# 3. Env Setup
if [ ! -f .env.local ]; then
  echo "📝 Initializing .env.local..."
  cp .env.local.example .env.local
  SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  sed -i "s/CLAWSHIELD_AGENT_SECRET=.*/CLAWSHIELD_AGENT_SECRET=$SECRET/" .env.local
fi

# 4. Pull and Up
echo "🐳 Booting containers..."
docker compose pull
docker compose up -d

echo "✅ ClawShield is ready!"
echo "Open http://localhost:3000 to complete setup."
