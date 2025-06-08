# Script PowerShell para testar Webhook LiveTip Atualizado
# Arquivo: test-webhook-enhanced.ps1

param(
    [string]$Url = "http://localhost:3001/webhook",
    [string]$Token = "2400613d5c2fb33d76e76c298d1dab4c",
    [string]$UserName = "Leonardo_Enhanced_Test",
    [double]$Amount = 99.75
)

Write-Host "🧪 Testando Webhook LiveTip ATUALIZADO com PowerShell" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Yellow

# Função para fazer requisição HTTP
function Invoke-WebhookTest {
    param(
        [string]$TestName,
        [hashtable]$Headers,
        [object]$Data
    )
    
    Write-Host "`n🎯 $TestName" -ForegroundColor Yellow
    Write-Host "-" * 40 -ForegroundColor Gray
    
    try {
        $jsonData = $Data | ConvertTo-Json -Depth 3
        Write-Host "📡 Payload:" -ForegroundColor Green
        Write-Host $jsonData -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri $Url -Method POST -Body $jsonData -ContentType "application/json" -Headers $Headers
        
        Write-Host "✅ Sucesso! Resposta:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 2) -ForegroundColor Cyan
        
        return $response
    }
    catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "📊 Status Code: $statusCode" -ForegroundColor Yellow
        }
        return $null
    }
}

# Teste 1: Webhook payment_confirmed válido
$webhookData1 = @{
    "event" = "payment_confirmed"
    "payment" = @{
        "sender" = $UserName
        "receiver" = "livetip_merchant"
        "content" = "Pagamento LiveTip Enhanced - $UserName"
        "amount" = $Amount
        "currency" = "BRL"
        "timestamp" = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
        "paid" = $true
        "paymentId" = "lt_pay_enhanced_$(Get-Random -Maximum 99999)"
        "read" = $true
    }
}

$validHeaders = @{"X-Livetip-Webhook-Secret-Token" = $Token}
$result1 = Invoke-WebhookTest "Pagamento Confirmado (Válido)" $validHeaders $webhookData1

# Teste 2: Webhook payment_pending
$webhookData2 = @{
    "event" = "payment_pending"
    "payment" = @{
        "sender" = $UserName
        "receiver" = "livetip_merchant"
        "content" = "Pagamento Pendente - $UserName"
        "amount" = 50.25
        "currency" = "BRL"
        "timestamp" = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
        "paid" = $false
        "paymentId" = "lt_pay_pending_$(Get-Random -Maximum 99999)"
        "read" = $false
    }
}

$result2 = Invoke-WebhookTest "Pagamento Pendente" $validHeaders $webhookData2

# Teste 3: Webhook payment_failed
$webhookData3 = @{
    "event" = "payment_failed"
    "payment" = @{
        "sender" = $UserName
        "receiver" = "livetip_merchant"
        "content" = "Pagamento Falhado - $UserName"
        "amount" = 25.00
        "currency" = "BRL"
        "timestamp" = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
        "paid" = $false
        "paymentId" = "lt_pay_failed_$(Get-Random -Maximum 99999)"
        "read" = $true
    }
}

$result3 = Invoke-WebhookTest "Pagamento Falhado" $validHeaders $webhookData3

# Teste 4: Token inválido
$invalidHeaders = @{"X-Livetip-Webhook-Secret-Token" = "token_invalido"}
$result4 = Invoke-WebhookTest "Token Inválido (deve falhar)" $invalidHeaders $webhookData1

# Teste 5: Sem token
$noTokenHeaders = @{}
$result5 = Invoke-WebhookTest "Sem Token (deve falhar)" $noTokenHeaders $webhookData1

# Teste 6: Payload inválido (sem event)
$invalidPayload = @{
    "payment" = @{
        "sender" = $UserName
        "amount" = $Amount
    }
}

$result6 = Invoke-WebhookTest "Payload Inválido (sem event)" $validHeaders $invalidPayload

# Teste 7: Dados incompletos (sem campos obrigatórios)
$incompleteData = @{
    "event" = "payment_confirmed"
    "payment" = @{
        "sender" = $UserName
        # Faltando amount, paymentId, paid
    }
}

$result7 = Invoke-WebhookTest "Dados Incompletos" $validHeaders $incompleteData

Write-Host "`n📊 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Yellow

$tests = @(
    @{Name="Pagamento Confirmado"; Result=$result1; Expected="✅ Sucesso"},
    @{Name="Pagamento Pendente"; Result=$result2; Expected="✅ Sucesso"},
    @{Name="Pagamento Falhado"; Result=$result3; Expected="✅ Sucesso"},
    @{Name="Token Inválido"; Result=$result4; Expected="❌ Falha (403)"},
    @{Name="Sem Token"; Result=$result5; Expected="❌ Falha (401)"},
    @{Name="Payload Inválido"; Result=$result6; Expected="❌ Falha (400)"},
    @{Name="Dados Incompletos"; Result=$result7; Expected="❌ Falha (400)"}
)

foreach ($test in $tests) {
    $status = if ($test.Result) { "✅ PASSOU" } else { "❌ FALHOU" }
    $color = if ($test.Result) { "Green" } else { "Red" }
    Write-Host "• $($test.Name): $status ($($test.Expected))" -ForegroundColor $color
}

Write-Host "`n🔍 TESTANDO ENDPOINTS DE MONITORAMENTO" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Yellow

# Testar endpoint de logs
try {
    Write-Host "`n📋 Testando /webhook-logs..." -ForegroundColor Yellow
    $logsResponse = Invoke-RestMethod -Uri "http://localhost:3001/webhook-logs?limit=5" -Method GET
    Write-Host "✅ Logs obtidos: $($logsResponse.total) total, $($logsResponse.logs.Count) retornados" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erro ao obter logs: $($_.Exception.Message)" -ForegroundColor Red
}

# Testar endpoint de estatísticas
try {
    Write-Host "`n📊 Testando /webhook-stats..." -ForegroundColor Yellow
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:3001/webhook-stats" -Method GET
    Write-Host "✅ Estatísticas obtidas:" -ForegroundColor Green
    Write-Host "   • Total Webhooks: $($statsResponse.totalWebhooks)" -ForegroundColor Cyan
    Write-Host "   • Total Pagamentos: $($statsResponse.totalPayments)" -ForegroundColor Cyan
    Write-Host "   • Eventos: $($statsResponse.eventCounts | ConvertTo-Json -Compress)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Erro ao obter estatísticas: $($_.Exception.Message)" -ForegroundColor Red
}

# Testar endpoint de pagamentos
try {
    Write-Host "`n💰 Testando /payments..." -ForegroundColor Yellow
    $paymentsResponse = Invoke-RestMethod -Uri "http://localhost:3001/payments" -Method GET
    Write-Host "✅ Pagamentos obtidos: $($paymentsResponse.total) total" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erro ao obter pagamentos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 TESTE COMPLETO FINALIZADO!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Yellow
Write-Host "🔗 Acesse http://localhost:3001/webhook-logs para ver os logs" -ForegroundColor Cyan
Write-Host "📊 Acesse http://localhost:3001/webhook-stats para estatísticas" -ForegroundColor Cyan
Write-Host "💰 Acesse http://localhost:3001/payments para ver pagamentos" -ForegroundColor Cyan
