# Deploy script for LiveTip MVP
$env:NODE_ENV = "production"

Write-Host "`n🚀 Preparando deploy do LiveTip MVP para Vercel..." -ForegroundColor Green

# Verificar se o CLI da Vercel está instalado
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
} catch {}

if ($null -eq $vercelInstalled) {
    Write-Host "`n⚠️ CLI da Vercel não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Falha ao instalar CLI da Vercel. Por favor instale manualmente com 'npm install -g vercel'" -ForegroundColor Red
        exit 1
    }
}

# Verificar se há arquivos temporários para ignorar
if (-not (Test-Path .vercelignore)) {
    @"
node_modules
.env
.env.local
npm-debug.log
.DS_Store
.vscode
"@ | Out-File -FilePath .vercelignore -Encoding utf8
    Write-Host "`n✅ Arquivo .vercelignore criado" -ForegroundColor Green
}

# Verificar dependências
Write-Host "`n🔍 Verificando dependências no package.json..." -ForegroundColor Blue
$packageJson = Get-Content -Raw -Path package.json | ConvertFrom-Json

$requiredDeps = @("express", "cors")
$missingDeps = @()

foreach ($dep in $requiredDeps) {
    if (-not $packageJson.dependencies.$dep) {
        $missingDeps += $dep
    }
}

if ($missingDeps.Count -gt 0) {
    Write-Host "`n⚠️ Algumas dependências estão faltando. Instalando: $($missingDeps -join ', ')" -ForegroundColor Yellow
    npm install --save $missingDeps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Falha ao instalar dependências" -ForegroundColor Red
        exit 1
    }
    Write-Host "`n✅ Dependências instaladas com sucesso" -ForegroundColor Green
}

# Executar testes locais
Write-Host "`n🧪 Executando testes do MVP..." -ForegroundColor Blue
node test-mvp.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ Alguns testes falharam. Deseja continuar com o deploy? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "`n❌ Deploy cancelado" -ForegroundColor Red
        exit 1
    }
}

# Fazer deploy para Vercel
Write-Host "`n🚀 Iniciando deploy para Vercel..." -ForegroundColor Green
Write-Host "Note: No primeiro deploy, você precisará fazer login na Vercel via navegador" -ForegroundColor Yellow

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "`n📝 Para testar a integração do webhook LiveTip, envie uma solicitação POST para:" -ForegroundColor Blue
    Write-Host "   [URL-DO-DEPLOY]/webhook" -ForegroundColor Yellow
    Write-Host "`n   Com o header:" -ForegroundColor Blue
    Write-Host "   X-Livetip-Webhook-Secret-Token: 0ac7b9aa00e75e0215243f3bb177c844" -ForegroundColor Yellow
    Write-Host "`n   E o body:" -ForegroundColor Blue
    Write-Host "   {\"id\": \"ID-DO-SEU-PAGAMENTO\"}" -ForegroundColor Yellow
    Write-Host "`n🔗 Para testar o health check, acesse:" -ForegroundColor Blue
    Write-Host "   [URL-DO-DEPLOY]/health" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Erro no deploy. Verifique os logs acima." -ForegroundColor Red
}

Write-Host "`n🏁 Script finalizado!" -ForegroundColor Green
