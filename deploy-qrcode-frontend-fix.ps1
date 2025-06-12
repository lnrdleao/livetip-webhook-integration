# Script para implantar a correção do problema de exibição do QR code
# Este script faz backup dos arquivos originais, aplica as correções e faz deploy

# Configurações
$backupFolder = "qr-frontend-fix-backup-$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$scriptOriginal = "public\script.js"
$scriptCorrigido = "public\script-fixed.js"
$scriptDebug = "public\script-debug.js"
$htmlDebug = "public\debug.html"

# Cores para melhor visualização
$colorInfo = "Cyan"
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"

Write-Host "🚀 DEPLOY DA CORREÇÃO DE QR CODE FRONTEND" -ForegroundColor $colorInfo
Write-Host "=========================================" -ForegroundColor $colorInfo

# 1. Criar pasta de backup
Write-Host "`n📂 Criando backup dos arquivos originais..." -ForegroundColor $colorInfo
if (!(Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder | Out-Null
    Write-Host "✅ Pasta de backup criada: $backupFolder" -ForegroundColor $colorSuccess
} else {
    Write-Host "⚠️ Pasta de backup já existe: $backupFolder" -ForegroundColor $colorWarning
}

# 2. Fazer backup do script original
if (Test-Path $scriptOriginal) {
    Copy-Item $scriptOriginal -Destination "$backupFolder\script_original.js"
    Write-Host "✅ Backup do script original realizado" -ForegroundColor $colorSuccess
} else {
    Write-Host "❌ Script original não encontrado: $scriptOriginal" -ForegroundColor $colorError
    exit 1
}

# 3. Aplicar a correção
Write-Host "`n🔄 Aplicando correção do frontend..." -ForegroundColor $colorInfo

if (Test-Path $scriptCorrigido) {
    # Verificar se os arquivos são diferentes antes de copiar
    $hashOriginal = Get-FileHash $scriptOriginal -Algorithm MD5
    $hashCorrigido = Get-FileHash $scriptCorrigido -Algorithm MD5
    
    if ($hashOriginal.Hash -ne $hashCorrigido.Hash) {
        # Criar o script de backup se não existir
        if (!(Test-Path "$backupFolder\script_original.js")) {
            Copy-Item $scriptOriginal -Destination "$backupFolder\script_original.js"
        }
        
        # Copiar script corrigido sobre o original
        Copy-Item $scriptCorrigido -Destination $scriptOriginal -Force
        Write-Host "✅ Script corrigido aplicado com sucesso" -ForegroundColor $colorSuccess
    } else {
        Write-Host "ℹ️ O script corrigido já está aplicado (arquivos idênticos)" -ForegroundColor $colorInfo
    }
} else {
    Write-Host "❌ Script corrigido não encontrado: $scriptCorrigido" -ForegroundColor $colorError
    exit 1
}

# 4. Adicionar página de diagnóstico
Write-Host "`n🧪 Adicionando página de diagnóstico..." -ForegroundColor $colorInfo

if (Test-Path $scriptDebug -and Test-Path $htmlDebug) {
    # Verificar se já existe a página de debug
    $targetHtmlDebug = "public\debug.html" # Mesmo local
    $targetScriptDebug = "public\script-debug.js" # Já está no lugar certo
    
    # Copiar apenas se não existirem ou forem diferentes
    if (!(Test-Path $targetHtmlDebug) -or 
        (Get-FileHash $htmlDebug -Algorithm MD5).Hash -ne (Get-FileHash $targetHtmlDebug -Algorithm MD5).Hash) {
        Copy-Item $htmlDebug -Destination $targetHtmlDebug -Force
        Write-Host "✅ Página de diagnóstico (HTML) adicionada" -ForegroundColor $colorSuccess
    } else {
        Write-Host "ℹ️ Página de diagnóstico (HTML) já existe" -ForegroundColor $colorInfo
    }
    
    if ((Get-FileHash $scriptDebug -Algorithm MD5).Hash -ne (Get-FileHash $targetScriptDebug -Algorithm MD5).Hash) {
        Copy-Item $scriptDebug -Destination $targetScriptDebug -Force
        Write-Host "✅ Script de diagnóstico adicionado" -ForegroundColor $colorSuccess
    } else {
        Write-Host "ℹ️ Script de diagnóstico já existe" -ForegroundColor $colorInfo
    }
} else {
    Write-Host "⚠️ Arquivos de diagnóstico não encontrados, pulando esta etapa" -ForegroundColor $colorWarning
}

# 5. Verificar alterações do git
Write-Host "`n🔍 Verificando alterações..." -ForegroundColor $colorInfo
git status

# 6. Perguntar se deseja fazer commit das alterações
$doCommit = Read-Host "`nDeseja fazer commit das alterações? (S/N)"
if ($doCommit -eq "S" -or $doCommit -eq "s") {
    Write-Host "`n📝 Fazendo commit das alterações..." -ForegroundColor $colorInfo
    git add $scriptOriginal
    git add "public\debug.html"
    git add "public\script-debug.js"
    git commit -m "🔧 Corrige problema de exibição do QR code no frontend"
    Write-Host "✅ Commit realizado com sucesso" -ForegroundColor $colorSuccess
} else {
    Write-Host "⚠️ Commit não realizado" -ForegroundColor $colorWarning
}

# 7. Perguntar se deseja fazer deploy para produção
$doDeploy = Read-Host "`nDeseja fazer deploy para produção no Vercel? (S/N)"
if ($doDeploy -eq "S" -or $doDeploy -eq "s") {
    Write-Host "`n🚀 Iniciando deploy para produção..." -ForegroundColor $colorInfo
    
    # Verificar se vercel CLI está instalado
    $vercelInstalled = $null
    try {
        $vercelInstalled = vercel --version
    } catch {
        $vercelInstalled = $null
    }
    
    if ($vercelInstalled) {
        Write-Host "✅ Vercel CLI encontrado: $vercelInstalled" -ForegroundColor $colorSuccess
        
        # Fazer o deploy
        try {
            Write-Host "`n🚀 Executando deploy para Vercel..." -ForegroundColor $colorInfo
            vercel --prod
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor $colorSuccess
                
                # Adicionar detalhes do deploy no relatório
                $deployTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                $deployNote = @"

## Deploy da Correção

- **Data do Deploy**: $deployTimestamp
- **Arquivos Modificados**:
  - `public/script.js` - Corrigido para tratamento robusto de QR codes
  - `public/debug.html` - Adicionada página de diagnóstico
  - `public/script-debug.js` - Adicionado script de diagnóstico
- **Backup**: Arquivos originais salvos em `$backupFolder`

A correção está agora disponível em produção.
"@
                
                Add-Content -Path "QRCODE_FRONTEND_FIX_REPORT.md" -Value $deployNote
                Write-Host "✅ Relatório atualizado com informações do deploy" -ForegroundColor $colorSuccess
            } else {
                Write-Host "❌ Houve um problema com o deploy" -ForegroundColor $colorError
            }
        } catch {
            Write-Host "❌ Erro ao fazer deploy: $_" -ForegroundColor $colorError
        }
    } else {
        Write-Host "❌ Vercel CLI não encontrado! Instale com: npm i -g vercel" -ForegroundColor $colorError
    }
} else {
    Write-Host "⚠️ Deploy não realizado" -ForegroundColor $colorWarning
}

Write-Host "`n✅ PROCESSO DE DEPLOY CONCLUÍDO" -ForegroundColor $colorSuccess
Write-Host "=========================================" -ForegroundColor $colorSuccess

# 8. Instruções finais
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor $colorInfo
Write-Host "1. Acesse https://livetip-webhook-integration-8qpbvn4w5.vercel.app/ para testar em produção" -ForegroundColor $colorInfo
Write-Host "2. Acesse https://livetip-webhook-integration-8qpbvn4w5.vercel.app/debug.html para diagnósticos" -ForegroundColor $colorInfo
Write-Host "3. Verifique se o QR code está sendo exibido corretamente" -ForegroundColor $colorInfo
Write-Host "4. Execute ./diagnose-qrcode-save.ps1 para verificar a resposta da API" -ForegroundColor $colorInfo
Write-Host "`nPara restaurar a versão anterior, execute:" -ForegroundColor $colorWarning
Write-Host "Copy-Item '$backupFolder\script_original.js' -Destination '$scriptOriginal'" -ForegroundColor $colorWarning
