#!/usr/bin/env pwsh

# Test Script for LiveTip API
Write-Host "🧪 Testing LiveTip API Endpoints" -ForegroundColor Green

$baseUrl = "https://webhook-test-beta-three.vercel.app"

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Webhook Status
Write-Host "`n2. Testing Webhook Status..." -ForegroundColor Yellow
try {
    $webhook = Invoke-RestMethod -Uri "$baseUrl/webhook" -Method GET
    Write-Host "✅ Webhook: $($webhook.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Webhook failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: PIX Payment Generation
Write-Host "`n3. Testing PIX Payment Generation..." -ForegroundColor Yellow
try {
    $pixPayload = @{
        userName = "TestUser"
        paymentMethod = "pix"
        amount = "10.50"
        uniqueId = "test_" + (Get-Date -Format "yyyyMMdd_HHmmss")
    } | ConvertTo-Json

    $headers = @{
        'Content-Type' = 'application/json'
    }

    $pixResult = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -Body $pixPayload -Headers $headers
    Write-Host "✅ PIX: Payment ID $($pixResult.data.paymentId)" -ForegroundColor Green
    Write-Host "   Source: $($pixResult.data.source)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ PIX failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Bitcoin Payment Generation
Write-Host "`n4. Testing Bitcoin Payment Generation..." -ForegroundColor Yellow
try {
    $btcPayload = @{
        userName = "TestUser"
        paymentMethod = "bitcoin"
        amount = "1000"
        uniqueId = "test_btc_" + (Get-Date -Format "yyyyMMdd_HHmmss")
    } | ConvertTo-Json

    $btcResult = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -Body $btcPayload -Headers $headers
    Write-Host "✅ Bitcoin: Payment ID $($btcResult.data.paymentId)" -ForegroundColor Green
    Write-Host "   Source: $($btcResult.data.source)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Bitcoin failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test Complete!" -ForegroundColor Green
