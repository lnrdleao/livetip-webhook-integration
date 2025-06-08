# Script PowerShell para testar webhook LiveTip
# Arquivo: test-webhook.ps1

param(
    [string]$Url = "http://localhost:3001/webhook",
    [string]$Token = "2400613d5c2fb33d76e76c298d1dab4c",
    [string]$UserName = "PowerShell_User",
    [double]$Amount = 75.50
)

Write-Host "🧪 Testando Webhook LiveTip com PowerShell" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Yellow

# Dados do webhook
$webhookData = @{
    "event" = "payment_confirmed"
    "payment" = @{
        "sender" = $UserName
        "receiver" = "livetip_merchant"
        "content" = "Pagamento LiveTip PowerShell - $UserName"
        "amount" = $Amount
        "currency" = "BRL"
        "timestamp" = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
        "paid" = $true
        "paymentId" = "ps_pay_$(Get-Random)"
        "read" = $true
    }
} | ConvertTo-Json -Depth 3

Write-Host "📡 Enviando dados:" -ForegroundColor Green
Write-Host $webhookData -ForegroundColor Gray

try {
    # Teste 1: Webhook válido
    Write-Host "`n🎯 Teste 1: Webhook com token válido" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $Url -Method POST -Body $webhookData -ContentType "application/json" -Headers @{"X-Livetip-Webhook-Secret-Token" = $Token}
    Write-Host "✅ Sucesso! Resposta:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json) -ForegroundColor Gray

    # Teste 2: Token inválido
    Write-Host "`n🔒 Teste 2: Token inválido" -ForegroundColor Yellow
    try {
        $response2 = Invoke-RestMethod -Uri $Url -Method POST -Body $webhookData -ContentType "application/json" -Headers @{"X-Livetip-Webhook-Secret-Token" = "token_invalido"}
        Write-Host "❌ ERRO: Deveria ter rejeitado!" -ForegroundColor Red
    }
    catch {
        Write-Host "✅ Sucesso! Token inválido rejeitado (403)" -ForegroundColor Green
    }

    # Teste 3: Sem token
    Write-Host "`n🚨 Teste 3: Sem token" -ForegroundColor Yellow
    try {
        $response3 = Invoke-RestMethod -Uri $Url -Method POST -Body $webhookData -ContentType "application/json"
        Write-Host "❌ ERRO: Deveria ter rejeitado!" -ForegroundColor Red
    }
    catch {
        Write-Host "✅ Sucesso! Requisição sem token rejeitada (401)" -ForegroundColor Green
    }

    Write-Host "`n🎉 Todos os testes concluídos com sucesso!" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Erro no teste principal:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n📊 Para ver os logs do servidor, verifique o terminal do Node.js" -ForegroundColor Blue
Write-Host "🌐 Acesse a página em: http://localhost:3001" -ForegroundColor Blue
