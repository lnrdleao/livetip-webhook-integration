# Script para implantar correções finais do PIX e Bitcoin
# deploy-fixes-robustos.ps1
# Data: 12 de Junho de 2025

# Cores para log
$Green = @{ForegroundColor = "Green"}
$Red = @{ForegroundColor = "Red"}
$Yellow = @{ForegroundColor = "Yellow"}
$Cyan = @{ForegroundColor = "Cyan"}

function Write-Header {
    param($Text)
    Write-Host "`n===== $Text =====" @Cyan
}

# 1. Verificar diretório
Write-Header "Verificando ambiente"
$currentDir = (Get-Location).Path
Write-Host "✓ Diretório atual: $currentDir" @Green

# 2. Verificar dependências
Write-Host "Verificando dependências..." @Yellow
try {
    npm list --depth=0 | Out-Null
    Write-Host "✅ Dependências NPM ok" @Green
}
catch {
    Write-Host "⚠️ Erro ao verificar dependências, instalando..." @Yellow
    npm install
}

# 3. Executar testes
Write-Header "Executando testes"
Write-Host "Executando teste de correções finais..." @Yellow
try {
    node test-fixes-final.js
    if ($LASTEXITCODE -ne 0) {
        throw "Teste falhou com código $LASTEXITCODE"
    }
    Write-Host "✅ Testes passaram com sucesso!" @Green
}
catch {
    Write-Host "❌ ERRO nos testes. Corrija os problemas antes de continuar." @Red
    Write-Host $_.Exception.Message @Red
    exit 1
}

# 4. Realizar backup dos arquivos
Write-Header "Realizando backup dos arquivos"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backup_$timestamp"
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

Copy-Item -Path "qrCodeGenerator.js" -Destination "$backupDir\qrCodeGenerator.js"
Copy-Item -Path "server.js" -Destination "$backupDir\server.js"
Copy-Item -Path "liveTipService.js" -Destination "$backupDir\liveTipService.js"
Copy-Item -Path "public\script.js" -Destination "$backupDir\script.js"

Write-Host "✅ Backup realizado em: $backupDir" @Green

# 5. Preparar para implantação em produção
Write-Header "Preparando para implantação"
Write-Host "Verificando arquivo vercel.json..." @Yellow
if (-not (Test-Path "vercel.json")) {
    Write-Host "Criando arquivo vercel.json padrão..." @Yellow
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
    Write-Host "✅ Arquivo vercel.json criado" @Green
}
else {
    Write-Host "✅ Arquivo vercel.json já existe" @Green
}

# 6. Realizar implantação
Write-Header "IMPLANTAÇÃO"
$deploy = Read-Host "Deseja implantar para produção agora? (S/N)"

if ($deploy.ToUpper() -eq "S") {
    # Verificar se vercel CLI está instalado
    $vercelInstalled = $null
    try {
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
    } 
    catch {}

    if ($vercelInstalled) {
        Write-Host "Implantando para Vercel..." @Yellow
        vercel --prod
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Implantação concluída com sucesso!" @Green
        }
        else {
            Write-Host "❌ Erro durante a implantação" @Red
        }
    }
    else {
        Write-Host "Vercel CLI não encontrado. Instruções para implantação manual:" @Yellow
        Write-Host "1. Instale o Vercel CLI: npm i -g vercel" @Yellow
        Write-Host "2. Faça login: vercel login" @Yellow
        Write-Host "3. Execute o deploy: vercel --prod" @Yellow
    }
}
else {
    Write-Host "Implantação adiada. Execute 'vercel --prod' quando estiver pronto." @Yellow
}

Write-Header "CONCLUÍDO"
Write-Host "As correções foram aplicadas com sucesso!" @Green
Write-Host "Documentação: CORRECOES_FINAIS_ROBUSTAS_2025-06-12.md" @Cyan
