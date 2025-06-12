# Testar Endpoints da API LiveTip
Write-Host "🧪 Iniciando teste dos endpoints da API LiveTip..." -ForegroundColor Cyan

# Verificar se o diretório tests\integration existe
if (-not (Test-Path "tests\integration")) {
    Write-Host "Criando diretório tests\integration..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "tests\integration" -Force | Out-Null
}

# Executar o teste de integração
Write-Host "🚀 Executando teste dos endpoints PIX e Bitcoin..." -ForegroundColor Green
node tests/integration/livetip-endpoints.js

# Verificar se os arquivos de saída foram gerados
if (Test-Path "test-pix-code.txt") {
    Write-Host "✅ Arquivo test-pix-code.txt gerado com sucesso" -ForegroundColor Green
    
    # Mostrar primeiros caracteres do código PIX
    $pixCode = Get-Content -Path "test-pix-code.txt"
    Write-Host "📌 Amostra do código PIX:" -ForegroundColor Cyan
    Write-Host "$($pixCode.Substring(0, [Math]::Min(50, $pixCode.Length)))..." -ForegroundColor White
}

if (Test-Path "test-btc-response.json") {
    Write-Host "✅ Arquivo test-btc-response.json gerado com sucesso" -ForegroundColor Green
    
    # Mostrar conteúdo do arquivo JSON de resposta do Bitcoin
    $btcResponse = Get-Content -Path "test-btc-response.json" | ConvertFrom-Json
    Write-Host "📌 Detalhes da resposta Bitcoin:" -ForegroundColor Cyan
    Write-Host "   ID: $($btcResponse.id)" -ForegroundColor White
    Write-Host "   Amount: $($btcResponse.amount) satoshis" -ForegroundColor White
    Write-Host "   Lightning Invoice: $($btcResponse.code.Substring(0, [Math]::Min(50, $btcResponse.code.Length)))..." -ForegroundColor White
}

Write-Host "🏁 Teste de endpoints concluído!" -ForegroundColor Green
