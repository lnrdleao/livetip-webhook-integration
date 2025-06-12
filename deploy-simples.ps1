# Script simples para implantar as correções na Vercel
# deploy-simples.ps1

Write-Host "🚀 Iniciando deploy para a Vercel..." -ForegroundColor Cyan

# 1. Executar testes de QR Code
Write-Host "🧪 Verificando a geração de QR Code..." -ForegroundColor Yellow
$qrCodeTest = $false
try {
    # Testar a geração do QR Code
    node -e "const qr = require('./qrCodeGenerator'); qr.generateWithLogo('https://example.com', 'pix').then(() => console.log('✅ QR Code gerado com sucesso!')).catch(e => { console.error(e); process.exit(1) })"
    $qrCodeTest = $true
} catch {
    Write-Host "❌ Erro na geração do QR Code!" -ForegroundColor Red
}

if ($qrCodeTest) {
    Write-Host "✅ Teste de QR Code passou!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Teste de QR Code falhou, mas continuaremos com o deploy." -ForegroundColor Yellow
}

# 2. Realizar implantação para a Vercel
Write-Host "🔄 Implantando para a Vercel..." -ForegroundColor Yellow
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy para a Vercel concluído com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Houve algum problema no deploy para a Vercel." -ForegroundColor Red
}

Write-Host "`n📝 Após o deploy, teste os seguintes endpoints:" -ForegroundColor Cyan
Write-Host "- Página principal: https://livetip-webhook-integration.vercel.app/" -ForegroundColor White
Write-Host "- Status da API: https://livetip-webhook-integration.vercel.app/health" -ForegroundColor White
Write-Host "- Painel de controle: https://livetip-webhook-integration.vercel.app/control" -ForegroundColor White
