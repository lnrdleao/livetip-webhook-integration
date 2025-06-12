# PowerShell script para implantar as correções PIX e Bitcoin
# Script: deploy-pix-bitcoin-fix.ps1
# Data: 12 de Junho de 2025
# Última atualização: 12 de Junho de 2025 - Correção para QR code PIX em produção

Write-Host "🚀 Iniciando deploy das correções PIX e Bitcoin..." -ForegroundColor Cyan

# 1. Verificar se estamos no diretório correto
$currentDir = (Get-Location).Path
$expectedDir = "Página Pagto Test"
if (-not $currentDir.Contains($expectedDir)) {
    Write-Host "❌ ERRO: Execute este script no diretório do projeto: Página Pagto Test" -ForegroundColor Red
    exit 1
}

# 2. Executar testes para verificar as correções
Write-Host "🧪 Executando testes para verificar as correções..." -ForegroundColor Yellow
node test-fixes.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO nos testes. Corrija os problemas antes de continuar." -ForegroundColor Red
    exit 1
}

# 3. Verificar se o arquivo de configuração Vercel existe
if (-not (Test-Path "vercel.json")) {
    Write-Host "⚠️ Arquivo vercel.json não encontrado. Criando configuração padrão..." -ForegroundColor Yellow
    @"
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/simple/(.*)",
      "destination": "/api/index-simple"
    },
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ]
}
"@ | Out-File -Encoding utf8 "vercel.json"
}

# 4. Realizar o deploy para Vercel
Write-Host "🔄 Implantando para Vercel..." -ForegroundColor Yellow

# Verificar se vercel CLI está instalado
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
} catch {}

if ($vercelInstalled) {
    # Deploy usando Vercel CLI
    vercel --prod
} else {
    Write-Host "⚠️ Vercel CLI não encontrado. Instruções para deploy manual:" -ForegroundColor Yellow
    Write-Host "1. Instale o Vercel CLI: npm i -g vercel" -ForegroundColor White
    Write-Host "2. Faça login: vercel login" -ForegroundColor White
    Write-Host "3. Execute o deploy: vercel --prod" -ForegroundColor White
}

# 5. Concluir
Write-Host "✅ Deploy das correções PIX e Bitcoin concluído!" -ForegroundColor Green
Write-Host "📝 Verifique a documentação em DEPLOY_FINAL_2025-06-12.md para mais detalhes" -ForegroundColor Cyan
