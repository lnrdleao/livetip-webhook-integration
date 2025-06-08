#!/usr/bin/env pwsh
# Script para configurar PIX válido para pagamentos reais

Write-Host "🏦 CONFIGURAÇÃO PIX VÁLIDO" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Este script vai configurar uma chave PIX REAL" -ForegroundColor Red
Write-Host "    Os QR codes gerados poderão receber pagamentos de verdade!" -ForegroundColor Red
Write-Host ""

# Solicitar dados reais do usuário
Write-Host "📋 Por favor, informe seus dados PIX reais:" -ForegroundColor Green
Write-Host ""

# Chave PIX
Write-Host "🔑 CHAVE PIX (escolha uma opção):" -ForegroundColor Cyan
Write-Host "   1. Email (ex: leonardo@gmail.com)" -ForegroundColor Gray
Write-Host "   2. Telefone (ex: +5511999887766)" -ForegroundColor Gray
Write-Host "   3. CPF (ex: 12345678901)" -ForegroundColor Gray
Write-Host "   4. Chave aleatória" -ForegroundColor Gray
Write-Host ""

do {
    $pixKey = Read-Host "Digite sua chave PIX"
    if ([string]::IsNullOrWhiteSpace($pixKey)) {
        Write-Host "❌ Chave PIX não pode estar vazia!" -ForegroundColor Red
    }
} while ([string]::IsNullOrWhiteSpace($pixKey))

# Nome do recebedor
Write-Host ""
Write-Host "👤 NOME DO RECEBEDOR (aparece no PIX):" -ForegroundColor Cyan
Write-Host "   Máximo 25 caracteres, sem acentos" -ForegroundColor Gray

do {
    $receiverName = Read-Host "Digite seu nome (sem acentos)"
    if ([string]::IsNullOrWhiteSpace($receiverName)) {
        Write-Host "❌ Nome não pode estar vazio!" -ForegroundColor Red
    } elseif ($receiverName.Length -gt 25) {
        Write-Host "❌ Nome muito longo! Máximo 25 caracteres." -ForegroundColor Red
        $receiverName = ""
    }
} while ([string]::IsNullOrWhiteSpace($receiverName))

# Cidade
Write-Host ""
Write-Host "🏙️ CIDADE:" -ForegroundColor Cyan
Write-Host "   Máximo 15 caracteres, sem acentos" -ForegroundColor Gray

do {
    $city = Read-Host "Digite sua cidade (sem acentos)"
    if ([string]::IsNullOrWhiteSpace($city)) {
        Write-Host "❌ Cidade não pode estar vazia!" -ForegroundColor Red
    } elseif ($city.Length -gt 15) {
        Write-Host "❌ Cidade muito longa! Máximo 15 caracteres." -ForegroundColor Red
        $city = ""
    }
} while ([string]::IsNullOrWhiteSpace($city))

# Confirmar dados
Write-Host ""
Write-Host "📋 CONFIRMAÇÃO DOS DADOS:" -ForegroundColor Yellow
Write-Host "=" * 30 -ForegroundColor Yellow
Write-Host "🔑 Chave PIX: $pixKey" -ForegroundColor White
Write-Host "👤 Nome: $receiverName" -ForegroundColor White
Write-Host "🏙️ Cidade: $city" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "✅ Os dados estão corretos? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Configuração cancelada pelo usuário." -ForegroundColor Red
    exit 1
}

# Criar arquivo .env
$envContent = @"
# Configurações PIX válidas para pagamentos reais
PIX_KEY=$pixKey
PIX_RECEIVER_NAME=$receiverName
PIX_CITY=$city

# Token webhook LiveTip (mantenha este)
WEBHOOK_SECRET=2400613d5c2fb33d76e76c298d1dab4c
"@

try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
    
    Write-Host ""
    Write-Host "✅ CONFIGURAÇÃO SALVA COM SUCESSO!" -ForegroundColor Green
    Write-Host "=" * 40 -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Arquivo .env criado com suas credenciais reais" -ForegroundColor Cyan
    Write-Host "🔒 Arquivo .env é privado (não vai para Git)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Green
    Write-Host "   1. Reinicie o servidor: Ctrl+C e depois 'npm start'" -ForegroundColor Gray
    Write-Host "   2. Acesse: http://localhost:3001" -ForegroundColor Gray
    Write-Host "   3. Crie um pagamento teste" -ForegroundColor Gray
    Write-Host "   4. Use o QR code gerado para fazer um PIX real!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  ATENÇÃO: Agora os pagamentos são REAIS!" -ForegroundColor Red
    
} catch {
    Write-Host "❌ Erro ao salvar arquivo .env: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 Sistema configurado para PIX válido!" -ForegroundColor Green
