#!/usr/bin/env pwsh
# deploy-final-pix-bitcoin-correcao.ps1
# Script para fazer deploy das correções finais do QR code PIX/Bitcoin para produção na Vercel

# 0. Configurações
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$deployLogFile = "DEPLOY_LOG_$date.txt"

# Função para logging com timestamp
function Write-Log {
    param (
        [string]$message,
        [string]$type = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$type] $message"
    
    # Cor do console baseado no tipo
    $color = switch ($type) {
        "INFO" { "Cyan" }
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        default { "White" }
    }
    
    Write-Host $logMessage -ForegroundColor $color
    Add-Content -Path $deployLogFile -Value $logMessage
}

# 1. Banner de início
Write-Log "==========================================================="
Write-Log "   DEPLOY FINAL - CORREÇÃO PIX/BITCOIN QR CODE PRODUCTION"
Write-Log "   Data: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")"
Write-Log "==========================================================="

# 2. Verificar se estamos no diretório correto
$currentDir = (Get-Location).Path
$projectName = "LiveTip\Página Pagto Test"
if (-not $currentDir.Contains("Pagto Test")) {
    Write-Log "Diretório incorreto. Execute este script no diretório do projeto LiveTip\Página Pagto Test" "ERROR"
    exit 1
}

# 3. Backup dos arquivos principais antes do deploy
Write-Log "Criando backup dos arquivos antes do deploy..."
$backupDir = "backup_deploy_$date"
New-Item -Path $backupDir -ItemType Directory | Out-Null

Write-Log "Copiando arquivos para backup..."
Copy-Item -Path ".\public\script.js" -Destination "$backupDir\script.js" -ErrorAction SilentlyContinue
Copy-Item -Path ".\api\index.js" -Destination "$backupDir\index.js" -ErrorAction SilentlyContinue
Copy-Item -Path ".\pix-fix-based-on-bitcoin.js" -Destination "$backupDir\pix-fix-based-on-bitcoin.js" -ErrorAction SilentlyContinue
Copy-Item -Path ".\vercel.json" -Destination "$backupDir\vercel.json" -ErrorAction SilentlyContinue

Write-Log "Backup concluído em $backupDir" "SUCCESS"

# 4. Verificar se todos os arquivos necessários existem
$requiredFiles = @(
    ".\public\script.js",
    ".\api\index.js",
    ".\pix-fix-based-on-bitcoin.js",
    ".\vercel.json"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Log "Arquivo necessário não encontrado: $file" "ERROR"
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Log "Faltam arquivos necessários. Abortando deploy." "ERROR"
    exit 1
}

# 5. Executar teste local antes de deploy (opcional)
Write-Log "Deseja executar testes locais antes do deploy? (S/N)" "INFO"
$runTests = Read-Host

if ($runTests -eq "S" -or $runTests -eq "s") {
    Write-Log "Executando testes locais..."
    try {
        & node verificar-correcao-pix-bitcoin.js
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Testes falharam com código $LASTEXITCODE" "ERROR"
            Write-Log "Deseja continuar mesmo assim? (S/N)" "WARNING"
            $continueAnyway = Read-Host
            
            if ($continueAnyway -ne "S" -and $continueAnyway -ne "s") {
                Write-Log "Deploy abortado pelo usuário." "WARNING"
                exit 1
            }
        } else {
            Write-Log "Testes locais concluídos com sucesso" "SUCCESS"
        }
    } catch {
        Write-Log "Erro ao executar testes: $_" "ERROR"
        Write-Log "Deseja continuar mesmo assim? (S/N)" "WARNING"
        $continueAnyway = Read-Host
        
        if ($continueAnyway -ne "S" -and $continueAnyway -ne "s") {
            Write-Log "Deploy abortado pelo usuário." "WARNING"
            exit 1
        }
    }
}

# 6. Verificar se Vercel CLI está instalado
Write-Log "Verificando instalação do Vercel CLI..."
try {
    $vercelVersion = & vercel --version
    Write-Log "Vercel CLI encontrado: $vercelVersion" "SUCCESS"
} catch {
    Write-Log "Vercel CLI não encontrado. Tentando instalar..." "WARNING"
    try {
        & npm install -g vercel
        Write-Log "Vercel CLI instalado com sucesso" "SUCCESS"
    } catch {
        Write-Log "Falha ao instalar Vercel CLI: $_" "ERROR"
        Write-Log "Por favor, instale manualmente o Vercel CLI usando 'npm install -g vercel'" "ERROR"
        exit 1
    }
}

# 7. Deploy para produção
Write-Log "Iniciando deploy para produção (Vercel)..." "INFO"
Write-Log "Este processo pode levar alguns minutos. Por favor, aguarde." "INFO"

try {
    # Deploy para produção
    & vercel --prod
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Deploy falhou com código $LASTEXITCODE" "ERROR"
        Write-Log "Verifique os erros reportados pelo Vercel CLI" "ERROR"
        exit 1
    }
    
    Write-Log "Deploy concluído com sucesso!" "SUCCESS"
    
} catch {
    Write-Log "Erro durante deploy: $_" "ERROR"
    exit 1
}

# 8. Gerar relatório de deploy
$deployReportContent = @"
# DEPLOY PIX/BITCOIN QR CODE - CORREÇÃO FINAL

**Data:** $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
**Deploy ID:** DEPLOY_$date

## ✅ CORREÇÕES APLICADAS

1. **Frontend (script.js)**:
   - Unificação do tratamento de PIX e Bitcoin
   - Garantia de exibição de QR code em ambos os ambientes
   - Função `ensureQRCodeData()` aprimorada

2. **Backend (api/index.js)**:
   - Tratamento unificado para respostas PIX/Bitcoin
   - Integração com módulo `pixFixModule`
   - Consistência entre ambientes local e produção

3. **Módulo de Correção (pix-fix-based-on-bitcoin.js)**:
   - Garantia de formato consistente entre ambientes
   - Fallback para API externa de QR code quando necessário

4. **Configuração (vercel.json)**:
   - Inclusão do módulo de correção para deploy

## 🔧 COMO VERIFICAR A CORREÇÃO

1. Acesse a aplicação em produção
2. Teste a geração de QR code para pagamentos PIX
3. Teste a geração de QR code para pagamentos Bitcoin
4. Verifique se ambos funcionam consistentemente

## 📋 OBSERVAÇÕES

- Esta correção resolve o problema onde o QR code PIX funcionava apenas localmente
- Bitcoin continua funcionando como antes
- A solução utiliza a mesma abordagem que já funcionava para Bitcoin
- O sistema agora usa uma API externa de QR code como fallback quando necessário

---

Equipe de Desenvolvimento LiveTip  
$(Get-Date -Format "dd/MM/yyyy")
"@

$deployReportFile = "DEPLOY_PIX_BITCOIN_QR_PRODUCAO_$date.md"
$deployReportContent | Out-File -FilePath $deployReportFile -Encoding UTF8
Write-Log "Relatório de deploy gerado: $deployReportFile" "SUCCESS"

# 9. Instruções finais
Write-Log "==========================================================="
Write-Log "   DEPLOY CONCLUÍDO COM SUCESSO!" "SUCCESS"
Write-Log "==========================================================="
Write-Log "Próximos passos:"
Write-Log "1. Acesse a URL da aplicação em produção (Vercel)"
Write-Log "2. Verifique se o QR code PIX está sendo exibido corretamente"
Write-Log "3. Verifique se o QR code Bitcoin continua funcionando"
Write-Log "4. Consulte o relatório de deploy para mais detalhes: $deployReportFile"
Write-Log "==========================================================="
