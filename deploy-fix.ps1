# Deploy PIX Fix to Vercel Production
Write-Host "🚀 Deploying PIX fix to Vercel..." -ForegroundColor Green

# Change to project directory
Set-Location "c:\Users\Leonardo\OneDrive\Área de Trabalho\LiveTip\Página Pagto Test"

# Check if api/index.js exists and has content
if (Test-Path "api\index.js") {
    $fileSize = (Get-Item "api\index.js").Length
    Write-Host "✅ api/index.js found - Size: $fileSize bytes" -ForegroundColor Green
} else {
    Write-Host "❌ api/index.js not found!" -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "📡 Running Vercel deployment..." -ForegroundColor Yellow
vercel --prod

Write-Host "🎯 Deployment complete! Testing endpoints..." -ForegroundColor Green

# Wait a moment for deployment to propagate
Start-Sleep -Seconds 5

# Test the endpoints
Write-Host "🧪 Testing health endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://livetip-webhook-integration.vercel.app/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Health check: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🧪 Testing webhook endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://livetip-webhook-integration.vercel.app/webhook" -Method GET -TimeoutSec 10
    Write-Host "✅ Webhook check: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Webhook check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "" 
Write-Host "🎉 PIX fix deployment completed!" -ForegroundColor Green
Write-Host "📋 You can test PIX payments at: https://livetip-webhook-integration.vercel.app/" -ForegroundColor White
Write-Host "📊 Monitor webhooks at: https://livetip-webhook-integration.vercel.app/webhook-monitor" -ForegroundColor White