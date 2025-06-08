#!/usr/bin/env pwsh
# Script para configurar credenciais da API LiveTip

Write-Host "🔐 CONFIGURAÇÃO API LIVETIP" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host ""
Write-Host "Este script vai configurar suas credenciais da API LiveTip" -ForegroundColor Green
Write-Host "para melhorar a integração e gerar QR codes PIX válidos." -ForegroundColor Green
Write-Host ""

# Solicitar credenciais
Write-Host "📋 Por favor, informe suas credenciais da API LiveTip:" -ForegroundColor Green
Write-Host ""

# Username/Email
Write-Host "👤 EMAIL/USERNAME:" -ForegroundColor Cyan
do {
    $username = Read-Host "Digite seu email/username da LiveTip"
    if ([string]::IsNullOrWhiteSpace($username)) {
        Write-Host "❌ Email/username não pode estar vazio!" -ForegroundColor Red
    }
} while ([string]::IsNullOrWhiteSpace($username))

# Password (hidden)
Write-Host ""
Write-Host "🔒 SENHA:" -ForegroundColor Cyan
Write-Host "   (a senha será ocultada durante a digitação)" -ForegroundColor Gray
do {
    $securePassword = Read-Host "Digite sua senha da LiveTip" -AsSecureString
    $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    if ([string]::IsNullOrWhiteSpace($password)) {
        Write-Host "❌ Senha não pode estar vazia!" -ForegroundColor Red
    }
} while ([string]::IsNullOrWhiteSpace($password))

# Token da API (opcional)
Write-Host ""
Write-Host "🎫 TOKEN DA API (opcional):" -ForegroundColor Cyan
Write-Host "   Se você já tem um token de API, digite aqui." -ForegroundColor Gray
Write-Host "   Caso contrário, deixe em branco (será gerado automaticamente)." -ForegroundColor Gray
$apiToken = Read-Host "Token da API (opcional)"

# Confirmar dados
Write-Host ""
Write-Host "📋 CONFIRMAÇÃO DOS DADOS:" -ForegroundColor Yellow
Write-Host "=" * 30 -ForegroundColor Yellow
Write-Host "👤 Username: $username" -ForegroundColor White
Write-Host "🔒 Senha: $('*' * $password.Length)" -ForegroundColor White
if ($apiToken) {
    Write-Host "🎫 Token: $($apiToken.Substring(0, [Math]::Min(10, $apiToken.Length)))..." -ForegroundColor White
} else {
    Write-Host "🎫 Token: (será gerado automaticamente)" -ForegroundColor Gray
}
Write-Host ""

$confirm = Read-Host "✅ Os dados estão corretos? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Configuração cancelada pelo usuário." -ForegroundColor Red
    exit 1
}

# Ler arquivo .env atual
$envContent = ""
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
}

# Atualizar credenciais no .env
$newEnvContent = $envContent

# Atualizar ou adicionar cada variável
if ($newEnvContent -match "LIVETIP_USERNAME=.*") {
    $newEnvContent = $newEnvContent -replace "LIVETIP_USERNAME=.*", "LIVETIP_USERNAME=$username"
} else {
    $newEnvContent += "`nLIVETIP_USERNAME=$username"
}

if ($newEnvContent -match "LIVETIP_PASSWORD=.*") {
    $newEnvContent = $newEnvContent -replace "LIVETIP_PASSWORD=.*", "LIVETIP_PASSWORD=$password"
} else {
    $newEnvContent += "`nLIVETIP_PASSWORD=$password"
}

if ($apiToken) {
    if ($newEnvContent -match "API_TOKEN=.*") {
        $newEnvContent = $newEnvContent -replace "API_TOKEN=.*", "API_TOKEN=$apiToken"
    } else {
        $newEnvContent += "`nAPI_TOKEN=$apiToken"
    }
}

try {
    $newEnvContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
    
    Write-Host ""
    Write-Host "✅ CREDENCIAIS SALVAS COM SUCESSO!" -ForegroundColor Green
    Write-Host "=" * 40 -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Arquivo .env atualizado com suas credenciais" -ForegroundColor Cyan
    Write-Host "🔒 Credenciais são privadas (não vão para Git)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Green
    Write-Host "   1. Reinicie o servidor: Ctrl+C e depois 'npm run dev'" -ForegroundColor Gray
    Write-Host "   2. Teste um pagamento: http://localhost:3001" -ForegroundColor Gray
    Write-Host "   3. Verifique os logs para confirmar autenticação" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔍 ENDPOINT ATUALIZADO:" -ForegroundColor Green
    Write-Host "   https://api.livetip.gg/api/v1/message/10" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERRO ao salvar credenciais:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "✨ Configuração concluída! Agora você terá uma integração" -ForegroundColor Green
Write-Host "   mais robusta com autenticação adequada." -ForegroundColor Green
