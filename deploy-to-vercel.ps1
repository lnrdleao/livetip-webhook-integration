# LiveTip Vercel Deploy Script
Write-Host "🚀 Starting LiveTip Vercel Deploy" -ForegroundColor Green

# Set working directory
Set-Location "c:\Users\Leonardo\OneDrive\Área de Trabalho\LiveTip\Página Pagto Test"

# Clean old Vercel config
Write-Host "🧹 Cleaning old Vercel configuration..." -ForegroundColor Yellow
Remove-Item -Path ".vercel" -Recurse -Force -ErrorAction SilentlyContinue

# Test if file is clean
Write-Host "📋 Checking api/index.js..." -ForegroundColor Yellow
if (Test-Path "api/index.js") {
    $fileContent = Get-Content "api/index.js" -Raw
    if ($fileContent -match "module.exports = async") {
        Write-Host "✅ API file looks good" -ForegroundColor Green
    } else {
        Write-Host "❌ API file may have issues" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ api/index.js not found" -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "When prompted, select: livetip-webhook-integration" -ForegroundColor Cyan

# Start deployment
vercel --prod

Write-Host "✅ Deploy script completed!" -ForegroundColor Green
