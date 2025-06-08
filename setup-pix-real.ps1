# Script para configurar PIX real
# Este script vai te ajudar a configurar suas credenciais PIX para testes reais

Write-Host "🏦 CONFIGURAÇÃO PIX REAL" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script vai configurar suas credenciais PIX reais para testes." -ForegroundColor Yellow
Write-Host "Suas informações ficarão no arquivo .env (privado)." -ForegroundColor Gray
Write-Host ""

# Verificar se .env já existe
if (Test-Path ".env") {
    Write-Host "⚠️  Arquivo .env já existe!" -ForegroundColor Yellow
    $overwrite = Read-Host "Deseja sobrescrever? (s/n)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "❌ Configuração cancelada." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "📝 PREENCHA SUAS INFORMAÇÕES PIX:" -ForegroundColor Cyan
Write-Host ""

# Coletar informações PIX
$pixKey = Read-Host "🔑 Sua chave PIX (email, telefone, CPF ou chave aleatória)"
$receiverName = Read-Host "👤 Seu nome completo (como aparece no banco)"
$city = Read-Host "🏙️  Sua cidade"

# Validar entradas
if (-not $pixKey -or -not $receiverName -or -not $city) {
    Write-Host "❌ Todos os campos são obrigatórios!" -ForegroundColor Red
    exit 1
}

# Criar arquivo .env
$envContent = @"
# Configuração PIX Real - Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
NODE_ENV=development
PORT=3001

# Configurações PIX REAIS
PIX_KEY=$pixKey
PIX_RECEIVER_NAME=$receiverName
PIX_CITY=$city

# Configurações LiveTip (deixar vazio até obter credenciais)
API_URL=https://api.livetip.gg/v1
API_TOKEN=
WEBHOOK_SECRET=2400613d5c2fb33d76e76c298d1dab4c
WEBHOOK_URL=http://localhost:3001/webhook

# Configurações Bitcoin (para testes)
BITCOIN_ADDRESS=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
BITCOIN_NETWORK=mainnet

# URL base
BASE_URL=http://localhost:3001
"@

# Salvar arquivo .env
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host ""
Write-Host "✅ Configuração PIX salva com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 SUAS CONFIGURAÇÕES:" -ForegroundColor Cyan
Write-Host "   🔑 Chave PIX: $pixKey" -ForegroundColor Gray
Write-Host "   👤 Nome: $receiverName" -ForegroundColor Gray
Write-Host "   🏙️  Cidade: $city" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   • O arquivo .env contém suas informações reais" -ForegroundColor Gray
Write-Host "   • NÃO compartilhe este arquivo" -ForegroundColor Gray
Write-Host "   • Ele já está no .gitignore (não será enviado ao Git)" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Green
Write-Host "   1. Execute: npm start" -ForegroundColor Cyan
Write-Host "   2. Acesse: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   3. Crie um pagamento PIX de teste" -ForegroundColor Cyan
Write-Host "   4. Use o QR code gerado para fazer um PIX real" -ForegroundColor Cyan
Write-Host ""

# Perguntar se quer iniciar o servidor
$startServer = Read-Host "Deseja iniciar o servidor agora? (s/n)"
if ($startServer -eq "s" -or $startServer -eq "S") {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor com configuração PIX real..." -ForegroundColor Green
    Start-Sleep -Seconds 2
    npm start
}
