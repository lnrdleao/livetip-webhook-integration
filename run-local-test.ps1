# Script para testar o LiveTip Webhook Integration localmente

Write-Host "🚀 Iniciando teste local do LiveTip Webhook..." -ForegroundColor Cyan
Write-Host ""

# Verificar se o servidor está rodando
$serverRunning = $false
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get -ErrorAction Stop
    $serverRunning = $true
    Write-Host "✅ Servidor está rodando!" -ForegroundColor Green
    Write-Host "   Status: $($healthCheck.status)"
    Write-Host "   Pagamentos: $($healthCheck.payments)"
    Write-Host "   Uptime: $($healthCheck.uptime) segundos"
} catch {
    Write-Host "❌ Servidor não está rodando! Execute 'npm run dev' primeiro." -ForegroundColor Red
    Write-Host "   Erro: $_"
}

if ($serverRunning) {
    # Executar o teste local
    Write-Host ""
    Write-Host "🧪 Executando testes do sistema LiveTip..." -ForegroundColor Cyan
    Write-Host ""
    
    node .\test-local.js
    
    Write-Host ""
    Write-Host "🔍 Verificando os arquivos gerados..." -ForegroundColor Cyan
    
    # Verificar se os arquivos de QR code foram gerados
    $qrFiles = @("test-local-pix.png", "test-local-btc.png", "test-local-qr-direct.png")
    
    foreach ($file in $qrFiles) {
        if (Test-Path $file) {
            $fileSize = (Get-Item $file).Length
            Write-Host "✅ $file gerado com sucesso ($fileSize bytes)" -ForegroundColor Green
        } else {
            Write-Host "❌ $file não foi gerado" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "📋 Para testar a interface web, acesse: http://localhost:3001" -ForegroundColor Yellow
    Write-Host "📋 Para monitorar webhooks, acesse: http://localhost:3001/webhook-monitor" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏁 Teste local concluído!" -ForegroundColor Cyan
