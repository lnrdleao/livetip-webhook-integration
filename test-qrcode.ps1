#!/usr/bin/env pwsh
# Teste para verificar se o QR code está sendo gerado

Write-Host "🧪 Testando geração de QR code..." -ForegroundColor Yellow

# Testar PIX
Write-Host "`n📱 Testando pagamento PIX..." -ForegroundColor Cyan

$pixPayload = @{
    userName = "Teste Usuario"
    amount = 25.50
    paymentMethod = "pix"
    email = "teste@exemplo.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/create-payment" `
        -Method POST `
        -Body $pixPayload `
        -ContentType "application/json" `
        -TimeoutSec 10

    if ($response.success) {
        Write-Host "✅ PIX criado com sucesso!" -ForegroundColor Green
        Write-Host "   ID: $($response.paymentId)" -ForegroundColor Gray
        Write-Host "   Fonte: $($response.paymentData.source)" -ForegroundColor Gray
        Write-Host "   QR Code: $($response.qrCodeImage.Length) caracteres" -ForegroundColor Gray
        Write-Host "   Código PIX: $($response.paymentData.pixCode.Length) caracteres" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erro ao criar PIX: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro na requisição PIX: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Testar Bitcoin
Write-Host "`n₿ Testando pagamento Bitcoin..." -ForegroundColor Cyan

$bitcoinPayload = @{
    userName = "Teste Usuario"
    amount = 50.00
    paymentMethod = "bitcoin"
    email = "teste@exemplo.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/create-payment" `
        -Method POST `
        -Body $bitcoinPayload `
        -ContentType "application/json" `
        -TimeoutSec 10

    if ($response.success) {
        Write-Host "✅ Bitcoin criado com sucesso!" -ForegroundColor Green
        Write-Host "   ID: $($response.paymentId)" -ForegroundColor Gray
        Write-Host "   Fonte: $($response.paymentData.source)" -ForegroundColor Gray
        Write-Host "   QR Code: $($response.qrCodeImage.Length) caracteres" -ForegroundColor Gray
        
        if ($response.paymentData.lightningInvoice) {
            Write-Host "   Lightning Invoice: $($response.paymentData.lightningInvoice.Length) caracteres" -ForegroundColor Gray
        }
        if ($response.paymentData.bitcoinUri) {
            Write-Host "   Bitcoin URI: $($response.paymentData.bitcoinUri.Length) caracteres" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Erro ao criar Bitcoin: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro na requisição Bitcoin: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🌐 Acesse http://localhost:3001 para testar a interface" -ForegroundColor Yellow
Write-Host "📊 Resultado: QR codes devem estar sendo gerados localmente quando LiveTip API falhar" -ForegroundColor Green
