# LiveTip Production Deploy - Final
Write-Host "🚀 Deploying LiveTip to Production" -ForegroundColor Green
Write-Host "Target: https://livetip-webhook-integration.vercel.app/" -ForegroundColor Cyan

# Set working directory
Set-Location "c:\Users\Leonardo\OneDrive\Área de Trabalho\LiveTip\Página Pagto Test"

# Check if api/index.js exists and is valid
if (Test-Path "api/index.js") {
    $fileSize = (Get-Item "api/index.js").Length
    Write-Host "✅ api/index.js found ($fileSize bytes)" -ForegroundColor Green
} else {
    Write-Host "❌ api/index.js not found!" -ForegroundColor Red
    exit 1
}

# Check vercel.json configuration
if (Test-Path "vercel.json") {
    Write-Host "✅ vercel.json configuration found" -ForegroundColor Green
} else {
    Write-Host "❌ vercel.json not found!" -ForegroundColor Red
    exit 1
}

# Start deployment
Write-Host "`n🚀 Starting Vercel deployment..." -ForegroundColor Yellow
Write-Host "This will deploy to the existing project: livetip-webhook-integration" -ForegroundColor Cyan

try {
    # Deploy with production flag
    vercel --prod --yes
    
    Write-Host "`n✅ Deployment completed!" -ForegroundColor Green
    Write-Host "🌐 Production URL: https://livetip-webhook-integration.vercel.app/" -ForegroundColor Cyan
    Write-Host "📊 Control Panel: https://livetip-webhook-integration.vercel.app/control" -ForegroundColor Cyan
    Write-Host "🎯 Webhook Monitor: https://livetip-webhook-integration.vercel.app/webhook-monitor" -ForegroundColor Cyan
    Write-Host "💚 Health Check: https://livetip-webhook-integration.vercel.app/health" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 LiveTip system is now live in production!" -ForegroundColor Green