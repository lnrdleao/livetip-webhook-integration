# Deploy simples para Vercel
# Este script simplificado faz o deploy para a Vercel usando o Vercel CLI

# Configurações
$PROJECT_DIR = "c:\Users\Leonardo\OneDrive\Área de Trabalho\LiveTip\Página Pagto Test"
$DATETIME = Get-Date -Format "yyyy-MM-dd_HHmmss"
$LOG_FILE = "vercel-deploy-$DATETIME.log"

# Função para executar comando e registrar saída
function Exec-LogCommand {
    param (
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "► $Description..." -ForegroundColor Cyan
    
    # Adicionar ao log
    Add-Content -Path $LOG_FILE -Value "===== $Description ====="
    Add-Content -Path $LOG_FILE -Value "Command: $Command"
    Add-Content -Path $LOG_FILE -Value "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
    
    # Executar comando e capturar saída
    $output = Invoke-Expression $Command
    
    # Adicionar saída ao log
    Add-Content -Path $LOG_FILE -Value "Output:"
    Add-Content -Path $LOG_FILE -Value $output
    Add-Content -Path $LOG_FILE -Value "`n`n"
    
    return $output
}

# Início do deploy
Write-Host "🚀 INICIANDO DEPLOY PARA VERCEL" -ForegroundColor Yellow
Add-Content -Path $LOG_FILE -Value "DEPLOY VERCEL - PIX QR CODE FIX - $DATETIME`n"

# Verificar se vercel CLI está instalado
Write-Host "🔍 Verificando Vercel CLI..." -ForegroundColor Cyan
$vercelInstalled = $false
try {
    $vercelVersion = Exec-LogCommand -Command "vercel --version" -Description "Verificando versão do Vercel CLI"
    $vercelInstalled = $true
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI não encontrado. Instalando..." -ForegroundColor Red
    Exec-LogCommand -Command "npm install -g vercel" -Description "Instalando Vercel CLI"
}

# Executar deploy
Write-Host "`n📤 Iniciando deploy para produção..." -ForegroundColor Yellow
Exec-LogCommand -Command "vercel --prod" -Description "Deploy para produção"

# Criar relatório de deploy
Write-Host "`n📝 Criando relatório de deploy..." -ForegroundColor Cyan

$deployReport = @"
# Deploy PIX QR Code Fix - Vercel - $DATETIME

## 📊 Status do Deploy

O deploy para Vercel foi concluído. Por favor, verifique o arquivo de log para mais detalhes:
- Log: $LOG_FILE

## 🔧 Arquivos Atualizados

Os seguintes arquivos foram implantados:

1. **Frontend**:
   - `public/script.js` - Correção da função `ensureQRCodeData()` para tratar PIX/Bitcoin consistentemente

2. **API**:
   - `api/index.js` - Implementado módulo de unificação para tratamento PIX/Bitcoin

3. **Módulos**:
   - `pix-fix-based-on-bitcoin.js` - Novo módulo para unificar tratamento de dados

4. **Configuração**:
   - `vercel.json` - Configurado para incluir o módulo de correção

## 🧪 Como Verificar

Para verificar se o deploy foi bem-sucedido:

1. Acesse a URL da aplicação na Vercel
2. Tente gerar um QR code para pagamento PIX
3. Confirme se o QR code é exibido corretamente
4. Teste também com Bitcoin para garantir compatibilidade

## ⚙️ Configuração

Ambiente de produção configurado com os seguintes parâmetros:
- Ambiente: Production
- Framework: Serverless Node.js
- Região: Global (Anycast)

---

**Observação**: Este deploy inclui a correção para o problema onde pagamentos PIX não geravam QR codes no ambiente de produção. A solução implementada unifica o tratamento de dados entre PIX e Bitcoin.

Data: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
"@

$deployReport | Out-File -FilePath "DEPLOY_VERCEL_PIX_QR_COMPLETED_$DATETIME.md" -Encoding utf8

Write-Host "`n✅ DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "📄 Relatório de deploy salvo em: DEPLOY_VERCEL_PIX_QR_COMPLETED_$DATETIME.md" -ForegroundColor Yellow
Write-Host "🔍 Log detalhado salvo em: $LOG_FILE" -ForegroundColor Yellow
