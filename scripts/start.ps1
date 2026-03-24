# ClawShield Launcher
# This script boots the full stack for local development/usage

Write-Host "🛰️ Launching ClawShield Infrastructure..." -ForegroundColor Green

# 1. Docker Backend
if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    docker-compose up -d
} else {
    Write-Host "⚠️ docker-compose not found. Skipping containerized backend." -ForegroundColor Yellow
}

# 2. Parallel Service Boot
Write-Host "🔥 Starting Agent-Core and Dashboard..." -ForegroundColor Cyan

# We use Start-Process to keep them running together
Start-Process npm -ArgumentList "run dev --workspace=@clawshield/agent-core" -NoNewWindow
Start-Process npm -ArgumentList "run dev --workspace=@clawshield/dashboard" -NoNewWindow

Write-Host "✨ Dashboard should soon be available at http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C in this window to stop (Note: background processes may persist)."
