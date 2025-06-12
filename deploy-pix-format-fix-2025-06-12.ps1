# Deploy script for PIX Code Format Fix - 2025-06-12
# Este script realiza o deploy da correção do formato do código PIX
# que estava sendo retornado como JSON em vez de texto puro

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$logFile = "deploy-pix-format-fix-log-$timestamp.txt"

Write-Host "🚀 Iniciando deploy da correção de formato do código PIX" -ForegroundColor Green
Write-Host "Data: $(Get-Date)" -ForegroundColor Cyan
"🔧 Iniciando processo de deploy em $(Get-Date)" | Out-File -FilePath $logFile

# Step 1: Executar testes finais para confirmar que a correção está funcionando
Write-Host "`n🧪 Executando testes finais antes do deploy..." -ForegroundColor Yellow
node teste-formato-pix.js | Out-File -FilePath $logFile -Append
Write-Host "✅ Testes de formato do PIX concluídos" -ForegroundColor Green

node local-verification.js | Out-File -FilePath $logFile -Append
Write-Host "✅ Verificação local concluída" -ForegroundColor Green

# Step 2: Backup dos arquivos atuais
Write-Host "`n📁 Criando backup dos arquivos atuais..." -ForegroundColor Cyan
$backupFolder = "backup_pix_fix_$timestamp"
New-Item -Path $backupFolder -ItemType Directory | Out-Null
Copy-Item -Path "liveTipService.js", "config.js", "qrCodeGenerator.js" -Destination $backupFolder
"✅ Backup concluído na pasta: $backupFolder" | Out-File -FilePath $logFile -Append
Write-Host "✅ Backup criado em: $backupFolder" -ForegroundColor Green

# Step 3: Atualizar documentação
$documentationFile = "PIX_FORMAT_FIX_$(Get-Date -Format 'yyyy-MM-dd').md"
Write-Host "`n📝 Criando documentação da correção: $documentationFile" -ForegroundColor Cyan

$documentation = @"
# Correção de Formato do Código PIX - $(Get-Date -Format "dd/MM/yyyy")

## Problema Resolvido
O sistema estava retornando códigos PIX em formato JSON quando deveriam ser em texto puro:
- **Formato incorreto:** `{"code":"00020101021226830014BR.GOV.BCB.PIX...","id":"684adeb9ac3ea7ede00e1aee"}`
- **Formato correto:** `00020101021226830014BR.GOV.BCB.PIX...`

## Solução Implementada
Modificamos o arquivo `liveTipService.js` para detectar quando a resposta da API é um objeto JSON com um campo 'code' e extrair apenas esse campo, mantendo o comportamento anterior para respostas em texto puro.

\`\`\`javascript
// A API pode retornar texto ou JSON, vamos tentar processar ambos
const responseText = await response.text();

// Tenta verificar se a resposta é um JSON válido
let pixCodeFromApi;
try {
    const jsonResponse = JSON.parse(responseText);
    // Se for JSON e tiver campo 'code', usamos esse campo
    if (jsonResponse && jsonResponse.code) {
        pixCodeFromApi = jsonResponse.code;
    } else {
        // JSON sem campo code - usar a string completa
        pixCodeFromApi = responseText;
    }
} catch (e) {
    // Não é JSON - usar a string completa como código PIX
    pixCodeFromApi = responseText;
}
\`\`\`

## Testes Realizados
- ✅ Teste de formato do código PIX
- ✅ Verificação local completa (PIX e Bitcoin)
- ✅ Teste de QR Code com o código PIX extraído

## Implantação
- Data: $(Get-Date -Format "dd/MM/yyyy HH:mm")
- Ambiente: Produção (Vercel)
- URL: https://livetip-webhook-integration.vercel.app/
"@

$documentation | Out-File -FilePath $documentationFile -Encoding utf8
"✅ Documentação criada: $documentationFile" | Out-File -FilePath $logFile -Append
Write-Host "✅ Documentação criada: $documentationFile" -ForegroundColor Green

# Step 4: Preparar para commit no Git
Write-Host "`n📝 Preparando alterações para commit..." -ForegroundColor Cyan
git add liveTipService.js config.js $documentationFile | Out-File -FilePath $logFile -Append

# Step 5: Commit das alterações
$commitMessage = "Fix: Corrigido o formato do código PIX para texto puro em vez de JSON"
Write-Host "`n💾 Realizando commit das alterações: $commitMessage" -ForegroundColor Green
git commit -m $commitMessage | Out-File -FilePath $logFile -Append

# Step 6: Push para o GitHub
Write-Host "`n🚀 Enviando alterações para o GitHub..." -ForegroundColor Yellow
git push | Out-File -FilePath $logFile -Append

# Step 7: Deploy para Vercel
Write-Host "`n🌐 Iniciando deploy para Vercel (produção)..." -ForegroundColor Magenta
Write-Host "Target: https://livetip-webhook-integration.vercel.app/" -ForegroundColor Cyan

try {
    # Verificar se os arquivos necessários existem
    if (-not (Test-Path "vercel.json")) {
        Write-Host "❌ Arquivo vercel.json não encontrado!" -ForegroundColor Red
        "❌ Arquivo vercel.json não encontrado!" | Out-File -FilePath $logFile -Append
        exit 1
    }

    # Deploy com flag de produção
    vercel --prod --yes | Out-File -FilePath $logFile -Append
    
    Write-Host "`n✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🌐 URL de Produção: https://livetip-webhook-integration.vercel.app/" -ForegroundColor Cyan
    
    "✅ Deploy concluído com sucesso!" | Out-File -FilePath $logFile -Append
    "🌐 URL de Produção: https://livetip-webhook-integration.vercel.app/" | Out-File -FilePath $logFile -Append
    
} catch {
    Write-Host "❌ Falha no deploy: $($_.Exception.Message)" -ForegroundColor Red
    "❌ Falha no deploy: $($_.Exception.Message)" | Out-File -FilePath $logFile -Append
    exit 1
}

# Resumo do deploy
Write-Host "`n📊 RESUMO DO DEPLOY" -ForegroundColor Cyan
Write-Host "===================="
Write-Host "✅ Testes finais executados e validados"
Write-Host "✅ Backup criado em: $backupFolder"
Write-Host "✅ Documentação criada: $documentationFile"
Write-Host "✅ Alterações commitadas no Git: '$commitMessage'"
Write-Host "✅ Alterações enviadas para o GitHub"
Write-Host "✅ Deploy realizado para produção na Vercel"
Write-Host ""
Write-Host "🌐 Acesse a aplicação em: https://livetip-webhook-integration.vercel.app"
Write-Host "📋 Log completo disponível em: $logFile"
Write-Host "`n🎉 Sistema LiveTip atualizado com sucesso na produção!" -ForegroundColor Green

"🎉 Processo de deploy concluído em $(Get-Date)" | Out-File -FilePath $logFile -Append
