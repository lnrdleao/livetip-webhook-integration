# LiveTip Final Deploy Script
Write-Host "🚀 Final LiveTip Deploy to Production" -ForegroundColor Green

# Force stop any running processes
Stop-Process -Name "vercel" -Force -ErrorAction SilentlyContinue

# Set working directory
Set-Location "c:\Users\Leonardo\OneDrive\Área de Trabalho\LiveTip\Página Pagto Test"

# Deploy directly
Write-Host "🚀 Deploying to livetip-webhook-integration..." -ForegroundColor Yellow
Start-Process "vercel" -ArgumentList "--prod" -Wait -NoNewWindow

Write-Host "✅ Deploy completed!" -ForegroundColor Green
Write-Host "🌐 URL: https://livetip-webhook-integration.vercel.app/" -ForegroundColor Cyan
