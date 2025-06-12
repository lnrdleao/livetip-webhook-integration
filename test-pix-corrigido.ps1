# Test PIX Payment Generation - Versão Corrigida
Write-Host "🧪 Testando Geração PIX Corrigida" -ForegroundColor Green

$baseUrl = "https://livetip-webhook-integration-7p7zmxji1.vercel.app"

# Test PIX payment generation
Write-Host "`n🏦 Testando Geração de Pagamento PIX..." -ForegroundColor Yellow
try {
    $pixPayload = @{
        userName = "TestUsuario"
        paymentMethod = "pix"
        amount = "15.50"
        uniqueId = "test_pix_corrigido_" + (Get-Date -Format "yyyyMMddHHmmss")
    } | ConvertTo-Json

    $headers = @{ 'Content-Type' = 'application/json' }
    $result = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -Body $pixPayload -Headers $headers -TimeoutSec 15

    Write-Host "✅ PIX Payment Generated Successfully!" -ForegroundColor Green
    Write-Host "   Payment ID: $($result.data.paymentId)" -ForegroundColor Cyan
    Write-Host "   Source: $($result.data.source)" -ForegroundColor Cyan
    Write-Host "   Amount: R$ $($result.data.amount)" -ForegroundColor Cyan
    Write-Host "   PIX Code Length: $($result.data.pixCode.Length) chars" -ForegroundColor Cyan
    Write-Host "   QR Code URL: $($result.data.qrCodeImage)" -ForegroundColor Cyan
    
    if ($result.data.pixCode.StartsWith("00020126")) {
        Write-Host "   ✅ PIX Code Format: Valid EMV Format" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ PIX Code Format: Unexpected format" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ PIX Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}

# Test Bitcoin payment generation
Write-Host "`n⚡ Testando Geração de Pagamento Bitcoin..." -ForegroundColor Yellow
try {
    $btcPayload = @{
        userName = "TestUsuario"
        paymentMethod = "bitcoin"
        amount = "2100"
        uniqueId = "test_btc_corrigido_" + (Get-Date -Format "yyyyMMddHHmmss")
    } | ConvertTo-Json

    $btcResult = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -Body $btcPayload -Headers $headers -TimeoutSec 15

    Write-Host "✅ Bitcoin Payment Generated Successfully!" -ForegroundColor Green
    Write-Host "   Payment ID: $($btcResult.data.paymentId)" -ForegroundColor Cyan
    Write-Host "   Source: $($btcResult.data.source)" -ForegroundColor Cyan
    Write-Host "   Amount: $($btcResult.data.amount) sats" -ForegroundColor Cyan
    Write-Host "   QR Code URL: $($btcResult.data.qrCodeImage)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Bitcoin Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Test Complete!" -ForegroundColor Green
