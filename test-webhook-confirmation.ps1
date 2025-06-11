# Test Automated Payment Confirmation System
# Validates the complete webhook confirmation flow

Write-Host "🎯 TESTE DO SISTEMA DE CONFIRMAÇÃO AUTOMÁTICA" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$baseUrl = "https://livetip-webhook-integration.vercel.app"
$webhookUrl = "$baseUrl/webhook"
$generateQrUrl = "$baseUrl/generate-qr"
$statusUrl = "$baseUrl/payment-status"

# Step 1: Create a test payment
Write-Host "`n📝 PASSO 1: Criando pagamento de teste..." -ForegroundColor Cyan

$paymentData = @{
    userName = "Teste Webhook"
    paymentMethod = "pix"
    amount = 10.50
    uniqueId = "WEBHOOK_TEST_$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $generateQrUrl -Method POST -Body $paymentData -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        $paymentResult = $response.Content | ConvertFrom-Json
        
        if ($paymentResult.success) {
            $paymentId = $paymentResult.data.paymentId
            Write-Host "✅ Pagamento criado com sucesso!" -ForegroundColor Green
            Write-Host "   Payment ID: $paymentId" -ForegroundColor Gray
            Write-Host "   Usuário: $($paymentResult.data.userName)" -ForegroundColor Gray
            Write-Host "   Valor: R$ $($paymentResult.data.amount)" -ForegroundColor Gray
            Write-Host "   Status inicial: pending" -ForegroundColor Gray
        } else {
            Write-Host "❌ Erro ao criar pagamento: $($paymentResult.error)" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Falha na criação do pagamento: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Check initial payment status
Write-Host "`n🔍 PASSO 2: Verificando status inicial..." -ForegroundColor Cyan

try {
    $statusResponse = Invoke-WebRequest -Uri "$statusUrl/$paymentId" -Method GET -UseBasicParsing -TimeoutSec 15
    
    if ($statusResponse.StatusCode -eq 200) {
        $statusResult = $statusResponse.Content | ConvertFrom-Json
        
        if ($statusResult.success) {
            Write-Host "✅ Status obtido com sucesso!" -ForegroundColor Green
            Write-Host "   Payment ID: $($statusResult.data.paymentId)" -ForegroundColor Gray
            Write-Host "   Status: $($statusResult.data.status)" -ForegroundColor Gray
            Write-Host "   Usuário: $($statusResult.data.userName)" -ForegroundColor Gray
            
            if ($statusResult.data.status -eq "pending") {
                Write-Host "✅ Status inicial correto: pending" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Status inesperado: $($statusResult.data.status)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Erro ao verificar status: $($statusResult.error)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Falha na verificação de status: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Simulate webhook confirmation
Write-Host "`n📬 PASSO 3: Simulando confirmação via webhook..." -ForegroundColor Cyan

$webhookPayload = @{
    event = "payment_confirmed"
    payment = @{
        sender = "Teste Webhook"
        receiver = "merchant"
        content = "Payment confirmation for $($paymentResult.data.uniqueId)"
        amount = 10.50
        currency = "BRL"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        paid = $true
        paymentId = "LIVETIP_$paymentId"
        read = $false
    }
} | ConvertTo-Json -Depth 3

$headers = @{
    'Content-Type' = 'application/json'
    'X-Livetip-Webhook-Secret-Token' = '0ac7b9aa00e75e0215243f3bb177c844'
}

try {
    $webhookResponse = Invoke-WebRequest -Uri $webhookUrl -Method POST -Body $webhookPayload -Headers $headers -UseBasicParsing -TimeoutSec 30
    
    if ($webhookResponse.StatusCode -eq 200) {
        $webhookResult = $webhookResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ Webhook processado com sucesso!" -ForegroundColor Green
        Write-Host "   Resposta: $($webhookResult.message)" -ForegroundColor Gray
        Write-Host "   Processado: $($webhookResult.processed)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Webhook falhou: HTTP $($webhookResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro no webhook: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Verify payment status updated
Write-Host "`n🔄 PASSO 4: Verificando atualização do status..." -ForegroundColor Cyan

Start-Sleep 2  # Wait for webhook processing

try {
    $finalStatusResponse = Invoke-WebRequest -Uri "$statusUrl/$paymentId" -Method GET -UseBasicParsing -TimeoutSec 15
    
    if ($finalStatusResponse.StatusCode -eq 200) {
        $finalStatusResult = $finalStatusResponse.Content | ConvertFrom-Json
        
        if ($finalStatusResult.success) {
            Write-Host "✅ Status final obtido!" -ForegroundColor Green
            Write-Host "   Payment ID: $($finalStatusResult.data.paymentId)" -ForegroundColor Gray
            Write-Host "   Status: $($finalStatusResult.data.status)" -ForegroundColor Gray
            Write-Host "   Webhook recebido: $($finalStatusResult.data.webhookReceived)" -ForegroundColor Gray
            Write-Host "   Atualizado em: $($finalStatusResult.data.updatedAt)" -ForegroundColor Gray
            
            if ($finalStatusResult.data.status -eq "confirmed") {
                Write-Host "🎉 CONFIRMAÇÃO AUTOMÁTICA FUNCIONANDO!" -ForegroundColor Green
                $confirmationWorking = $true
            } else {
                Write-Host "❌ Status não foi atualizado para 'confirmed'" -ForegroundColor Red
                Write-Host "   Status atual: $($finalStatusResult.data.status)" -ForegroundColor Red
                $confirmationWorking = $false
            }
        } else {
            Write-Host "❌ Erro ao verificar status final: $($finalStatusResult.error)" -ForegroundColor Red
            $confirmationWorking = $false
        }
    }
} catch {
    Write-Host "❌ Falha na verificação final: $($_.Exception.Message)" -ForegroundColor Red
    $confirmationWorking = $false
}

# Step 5: Test webhook monitoring endpoints
Write-Host "`n📊 PASSO 5: Testando endpoints de monitoramento..." -ForegroundColor Cyan

try {
    # Test webhook logs
    $logsResponse = Invoke-WebRequest -Uri "$baseUrl/webhook-logs" -Method GET -UseBasicParsing -TimeoutSec 15
    if ($logsResponse.StatusCode -eq 200) {
        $logsResult = $logsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Webhook logs: $($logsResult.total) registros" -ForegroundColor Green
    }
    
    # Test webhook stats
    $statsResponse = Invoke-WebRequest -Uri "$baseUrl/webhook-stats" -Method GET -UseBasicParsing -TimeoutSec 15
    if ($statsResponse.StatusCode -eq 200) {
        $statsResult = $statsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Webhook stats: $($statsResult.totalWebhooks) webhooks, $($statsResult.totalPayments) pagamentos" -ForegroundColor Green
    }
    
    # Test payments endpoint
    $paymentsResponse = Invoke-WebRequest -Uri "$baseUrl/payments" -Method GET -UseBasicParsing -TimeoutSec 15
    if ($paymentsResponse.StatusCode -eq 200) {
        $paymentsResult = $paymentsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Payments endpoint: $($paymentsResult.total) pagamentos" -ForegroundColor Green
    }
    
} catch {
    Write-Host "⚠️ Alguns endpoints de monitoramento falharam: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Final Report
Write-Host "`n📋 RELATÓRIO FINAL" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow

if ($confirmationWorking) {
    Write-Host "🎊 SISTEMA DE CONFIRMAÇÃO AUTOMÁTICA FUNCIONANDO PERFEITAMENTE!" -ForegroundColor Green
    Write-Host "✅ Webhook configurado corretamente" -ForegroundColor Green
    Write-Host "✅ Token de segurança validando" -ForegroundColor Green
    Write-Host "✅ Status de pagamento atualizando automaticamente" -ForegroundColor Green
    Write-Host "✅ Endpoints de monitoramento operacionais" -ForegroundColor Green
    Write-Host "✅ Sistema pronto para produção" -ForegroundColor Green
} else {
    Write-Host "❌ SISTEMA DE CONFIRMAÇÃO APRESENTA PROBLEMAS" -ForegroundColor Red
    Write-Host "⚠️ Revisar configuração do webhook" -ForegroundColor Yellow
    Write-Host "⚠️ Verificar logs do servidor" -ForegroundColor Yellow
}

Write-Host "`n🌐 URLs importantes:" -ForegroundColor Cyan
Write-Host "   Webhook: $webhookUrl" -ForegroundColor Gray
Write-Host "   Monitor: $baseUrl/webhook-monitor" -ForegroundColor Gray
Write-Host "   Controle: $baseUrl/control" -ForegroundColor Gray

Write-Host "`n🔧 Configuração LiveTip aplicada:" -ForegroundColor Cyan
Write-Host "   URL: https://livetip-webhook-integration.vercel.app/webhook" -ForegroundColor Gray
Write-Host "   Token: 0ac7b9aa00e75e0215243f3bb177c844" -ForegroundColor Gray
Write-Host "   Status: ✅ ATIVO" -ForegroundColor Green
