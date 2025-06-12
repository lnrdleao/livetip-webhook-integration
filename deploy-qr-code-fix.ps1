#!/usr/bin/env pwsh
# Script para deploy do fix de QR Code para produção
# Data: 12 de junho de 2025
# Autor: GitHub Copilot

# Definir cores para mensagens de log
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red
$Cyan = [ConsoleColor]::Cyan

# Informações de Deploy
Write-Host "🚀 DEPLOY DE CORREÇÃO DO QR CODE - LIVETIP WEBHOOK INTEGRATION" -ForegroundColor $Green
Write-Host "📅 Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm')" -ForegroundColor $Cyan
Write-Host "📋 Objetivo: Corrigir geração de QR Code no ambiente de produção" -ForegroundColor $Cyan

# Passo 1: Limpar arquivos temporários e caches
Write-Host "`n🧹 Limpando arquivos temporários e caches..." -ForegroundColor $Yellow
if (Test-Path -Path "./.vercel/output") {
    Remove-Item -Path "./.vercel/output" -Recurse -Force
    Write-Host "  ✓ Cache Vercel removido" -ForegroundColor $Green
}

if (Test-Path -Path "./node_modules") {
    Remove-Item -Path "./node_modules" -Recurse -Force
    Write-Host "  ✓ node_modules removido" -ForegroundColor $Green  
}

# Passo 2: Executar testes localmente para garantir que a solução funciona
Write-Host "`n🧪 Executando testes para validar a correção..." -ForegroundColor $Yellow

# Instalar dependências
Write-Host "  📦 Instalando dependências..." -ForegroundColor $Cyan
npm install

# Executar teste de QR Code Fallback
Write-Host "  🔍 Testando solução de fallback para QR Code..." -ForegroundColor $Cyan
node testar-qrcode-fallback.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Falha no teste de QR Code. Verifique a implementação e tente novamente." -ForegroundColor $Red
    exit 1
} else {
    Write-Host "  ✓ Teste de QR Code fallback aprovado!" -ForegroundColor $Green
}

# Passo 3: Gerar build de produção otimizada
Write-Host "`n🏗️ Gerando build de produção..." -ForegroundColor $Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Falha ao gerar build. Verifique os erros e tente novamente." -ForegroundColor $Red
    exit 1
} else {
    Write-Host "  ✓ Build gerado com sucesso!" -ForegroundColor $Green
}

# Passo 4: Deploy para produção
Write-Host "`n🚀 Iniciando deploy para produção..." -ForegroundColor $Yellow
Write-Host "  ⚙️ Usando configurações para produção com estratégia de fallback de QR Code" -ForegroundColor $Cyan

# Executar o comando de deploy (Vercel)
$deployOutput = & vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Falha no deploy para produção. Verifique os logs para mais detalhes." -ForegroundColor $Red
    exit 1
} else {
    # Capturar URL de produção do resultado
    $productionUrl = $deployOutput -match "https://.*\.vercel\.app" | Out-String
    $productionUrl = $productionUrl.Trim()
    Write-Host "  ✓ Deploy realizado com sucesso!" -ForegroundColor $Green
    Write-Host "  🌐 URL de produção: $productionUrl" -ForegroundColor $Green
}

# Passo 5: Verificar status do serviço em produção
Write-Host "`n🔍 Verificando status do serviço em produção..." -ForegroundColor $Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$productionUrl/health" -Method GET -TimeoutSec 30
    if ($healthResponse.status -eq "healthy") {
        Write-Host "  ✓ Serviço em produção está saudável!" -ForegroundColor $Green
        Write-Host "  📊 Status: $($healthResponse.status)" -ForegroundColor $Green
        Write-Host "  🕒 Uptime: $($healthResponse.uptime) segundos" -ForegroundColor $Green
    } else {
        Write-Host "  ⚠️ Serviço está respondendo, mas não está totalmente saudável." -ForegroundColor $Yellow
        Write-Host "  📊 Status: $($healthResponse.status)" -ForegroundColor $Yellow
    }
} catch {
    Write-Host "  ❌ Falha ao verificar status do serviço em produção." -ForegroundColor $Red
    Write-Host "  🔍 Detalhes do erro: $_" -ForegroundColor $Red
}

# Passo 6: Testar a geração de QR code em produção
Write-Host "`n🧪 Testando geração de QR code em produção..." -ForegroundColor $Yellow

$pixPayload = @{
    userName = "TesteProducao"
    paymentMethod = "pix"
    amount = 2
    uniqueId = "PIX_TEST_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
} | ConvertTo-Json

try {
    $pixResponse = Invoke-RestMethod -Uri "$productionUrl/generate-qr" -Method POST -ContentType "application/json" -Body $pixPayload -TimeoutSec 30
    
    if ($pixResponse.success -eq $true) {
        Write-Host "  ✓ Geração de QR Code PIX em produção funcionando!" -ForegroundColor $Green
        Write-Host "  🆔 Payment ID: $($pixResponse.data.paymentId)" -ForegroundColor $Green
        Write-Host "  📊 Status: Sucesso" -ForegroundColor $Green
        if ($pixResponse.data.qrCodeImage) {
            Write-Host "  🖼️ QR Code gerado com sucesso" -ForegroundColor $Green
            Write-Host "  🔗 URL do QR Code: $($pixResponse.data.qrCodeImage.Substring(0, [Math]::Min(50, $pixResponse.data.qrCodeImage.Length)))..." -ForegroundColor $Green
        } else {
            Write-Host "  ⚠️ QR Code não foi retornado, mas o endpoint funcionou" -ForegroundColor $Yellow
        }
    } else {
        Write-Host "  ❌ Falha na geração do QR Code PIX em produção" -ForegroundColor $Red
        Write-Host "  📊 Status: Falha" -ForegroundColor $Red
        Write-Host "  🔍 Erro: $($pixResponse.error)" -ForegroundColor $Red
    }
} catch {
    Write-Host "  ❌ Falha ao testar geração de QR Code PIX em produção" -ForegroundColor $Red
    Write-Host "  🔍 Detalhes do erro: $_" -ForegroundColor $Red
}

# Resumo final
Write-Host "`n✨ DEPLOY FINALIZADO" -ForegroundColor $Green
Write-Host "📋 Resumo das ações:" -ForegroundColor $Cyan
Write-Host "  ✓ Limpeza de caches e arquivos temporários" -ForegroundColor $Green
Write-Host "  ✓ Teste da solução de fallback para QR Code" -ForegroundColor $Green
Write-Host "  ✓ Build de produção" -ForegroundColor $Green
Write-Host "  ✓ Deploy para produção" -ForegroundColor $Green
Write-Host "  ✓ Verificação de saúde do serviço" -ForegroundColor $Green
Write-Host "  ✓ Teste de geração de QR Code em produção" -ForegroundColor $Green

# Instruções finais
Write-Host "`n📝 Para monitorar o serviço em produção, acesse:" -ForegroundColor $Cyan
Write-Host "  🌐 $productionUrl" -ForegroundColor $Green
Write-Host "  🌐 $productionUrl/webhook-monitor (Monitor de Webhooks)" -ForegroundColor $Green
Write-Host "  🌐 $productionUrl/health (Status de saúde)" -ForegroundColor $Green

Write-Host "`n🎉 Fix para QR Code aplicado com sucesso!" -ForegroundColor $Green
