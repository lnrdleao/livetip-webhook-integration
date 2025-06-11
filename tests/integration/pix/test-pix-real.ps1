# Script para testar pagamento PIX real
# Este script cria um pagamento de teste que você pode pagar de verdade

Write-Host "💰 TESTE PIX REAL" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o servidor está rodando
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Servidor rodando corretamente!" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor não está rodando!" -ForegroundColor Red
    Write-Host "   Execute primeiro: npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📝 CRIANDO PAGAMENTO PIX DE TESTE..." -ForegroundColor Cyan
Write-Host ""

# Coletar dados do pagamento
$userName = Read-Host "👤 Seu nome para o pagamento"
if (-not $userName) { $userName = "Teste PIX Real" }

$amount = Read-Host "💰 Valor do teste (ex: 0.01 para 1 centavo)"
if (-not $amount) { $amount = "0.01" }

try {
    $amountNum = [decimal]$amount
    if ($amountNum -le 0) {
        throw "Valor deve ser maior que zero"
    }
} catch {
    Write-Host "❌ Valor inválido! Use formato: 1.50" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Criando pagamento..." -ForegroundColor Yellow

# Criar pagamento
$payload = @{
    userName = $userName
    amount = $amountNum
    paymentMethod = "pix"
    email = "teste@exemplo.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/create-payment" `
        -Method POST `
        -Body $payload `
        -ContentType "application/json" `
        -TimeoutSec 15

    if ($response.success) {
        Write-Host ""
        Write-Host "✅ PAGAMENTO PIX CRIADO COM SUCESSO!" -ForegroundColor Green
        Write-Host "=======================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 DETALHES DO PAGAMENTO:" -ForegroundColor Cyan
        Write-Host "   🆔 ID: $($response.paymentId)" -ForegroundColor Gray
        Write-Host "   👤 Nome: $userName" -ForegroundColor Gray
        Write-Host "   💰 Valor: R$ $amount" -ForegroundColor Gray
        Write-Host "   🔧 Fonte: $($response.paymentData.source)" -ForegroundColor Gray
        
        if ($response.paymentData.pixKey) {
            Write-Host "   🔑 Chave PIX: $($response.paymentData.pixKey)" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "📱 CÓDIGO PIX PARA PAGAMENTO:" -ForegroundColor Green
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host $response.paymentData.pixCode -ForegroundColor White
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host ""
        
        # Salvar código PIX em arquivo
        $response.paymentData.pixCode | Out-File -FilePath "pix-code-$($response.paymentId).txt" -Encoding UTF8
        
        Write-Host "💾 Código PIX salvo em: pix-code-$($response.paymentId).txt" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🎯 COMO PAGAR:" -ForegroundColor Green
        Write-Host "   1. 📱 Abra seu app bancário" -ForegroundColor Cyan
        Write-Host "   2. 🔍 Vá em PIX > Pagar com código" -ForegroundColor Cyan
        Write-Host "   3. 📋 Cole o código PIX acima" -ForegroundColor Cyan
        Write-Host "   4. ✅ Confirme o pagamento" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🌐 INTERFACE WEB:" -ForegroundColor Green
        Write-Host "   Acesse: http://localhost:3001" -ForegroundColor Blue
        Write-Host "   Para ver o QR code visual" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📊 MONITORAMENTO:" -ForegroundColor Green
        Write-Host "   • O webhook está ativo em /webhook" -ForegroundColor Gray
        Write-Host "   • Logs aparecem no terminal do servidor" -ForegroundColor Gray
        Write-Host "   • Status é atualizado automaticamente" -ForegroundColor Gray
        Write-Host ""
        
        # Perguntar se quer abrir a interface web
        $openWeb = Read-Host "Deseja abrir a interface web? (s/n)"
        if ($openWeb -eq "s" -or $openWeb -eq "S") {
            Start-Process "http://localhost:3001"
        }
        
        # Perguntar se quer copiar código PIX
        $copyCode = Read-Host "Deseja copiar o código PIX para a área de transferência? (s/n)"
        if ($copyCode -eq "s" -or $copyCode -eq "S") {
            $response.paymentData.pixCode | Set-Clipboard
            Write-Host "📋 Código PIX copiado!" -ForegroundColor Green
        }
        
    } else {
        Write-Host "❌ Erro ao criar pagamento: $($response.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro na requisição: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 POSSÍVEIS SOLUÇÕES:" -ForegroundColor Yellow
    Write-Host "   • Verifique se o servidor está rodando" -ForegroundColor Gray
    Write-Host "   • Execute: npm start" -ForegroundColor Gray
    Write-Host "   • Verifique as configurações PIX no .env" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 Teste concluído!" -ForegroundColor Green
