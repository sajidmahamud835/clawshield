# ClawShield Windows Installer
# Purpose: Zero-terminal setup for non-technical users.

Write-Host "🚀 Starting ClawShield Setup..." -ForegroundColor Cyan

# 1. Environment Checks
function Check-Command($cmd) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        return $true
    }
    return $false
}

if (-not (Check-Command "node")) {
    Write-Host "❌ Error: Node.js is not installed. Please install Node.js 20+ first." -ForegroundColor Red
    exit 1
}

if (-not (Check-Command "docker")) {
    Write-Host "⚠️ Warning: Docker is not detected. Background agent logic will require Docker for full capability." -ForegroundColor Yellow
}

# 2. Workspace Initialization
Write-Host "📦 Installing dependencies (Monorepo)..." -ForegroundColor Gray
npm install --legacy-peer-deps

# 3. Env Setup
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Initializing environment variables..." -ForegroundColor Gray
    Copy-Item ".env.local.example" ".env.local"
    # Generate a random secret for JWT
    $secret = [Guid]::NewGuid().ToString()
    (Get-Content ".env.local") -replace "CLAWSHIELD_AGENT_SECRET=.*", "CLAWSHIELD_AGENT_SECRET=$secret" | Set-Content ".env.local"
}

# 4. Success
Write-Host "✅ ClawShield is ready!" -ForegroundColor Green
Write-Host "Run '.\scripts\start.ps1' to boot your AI agent." -ForegroundColor Cyan
