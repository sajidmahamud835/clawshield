# ClawShield Windows Installer (PowerShell)

echo "🚀 Starting ClawShield Setup..."

# 1. Checks: Docker Desktop via winget
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    echo "📦 Installing Docker Desktop via winget..."
    winget install Docker.DockerDesktop
    echo "Please restart your shell after installation completes."
    exit
}

# 2. Checks: WSL2
wsl --status
if ($LASTEXITCODE -ne 0) {
    echo "⚠️ WSL2 is required for Docker. Please enable it in Windows Features."
}

# 3. Env Setup
if (-not (Test-Path ".env.local")) {
    echo "📝 Initializing .env.local..."
    copy .env.local.example .env.local
    $secret = [Guid]::NewGuid().ToString("N")
    (Get-Content .env.local) -replace 'CLAWSHIELD_AGENT_SECRET=.*', "CLAWSHIELD_AGENT_SECRET=$secret" | Set-Content .env.local
}

# 4. Pull and Up
echo "🐳 Booting containers..."
docker compose pull
docker compose up -d

echo "✅ ClawShield is ready!"
echo "Open http://localhost:3000 to complete setup."
