# Script para testar a API de geração de QR code e salvar o resultado
# Este script é útil para depurar problemas de visualização do QR code

# Configuração
$productionUrl = "https://livetip-webhook-integration-8qpbvn4w5.vercel.app/generate-qr"
$localUrl = "http://localhost:3001/generate-qr"
$outputFolder = "qr-test-results"

# Criar pasta para resultados se não existir
if (!(Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder | Out-Null
    Write-Host "📁 Pasta de resultados criada: $outputFolder" -ForegroundColor Yellow
}

# Gerar ID único para este teste
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$testId = "TEST_$timestamp"

# Função para testar ambiente e salvar QR code
function Test-QRCodeApi {
    param (
        [string]$Url,
        [string]$Environment,
        [string]$PaymentMethod
    )
    
    # Criar payload baseado no método de pagamento
    if ($PaymentMethod -eq "pix") {
        $payload = @{
            userName = "TesteDiagnostico"
            paymentMethod = "pix"
            amount = 2
            uniqueId = "PIX_${testId}"
        }
    } else {
        $payload = @{
            userName = "TesteDiagnostico"
            paymentMethod = "bitcoin"
            amount = 1000
            uniqueId = "BTC_${testId}"
        }
    }
    
    $body = $payload | ConvertTo-Json
    
    Write-Host "`n🔍 TESTE: $Environment - $PaymentMethod" -ForegroundColor Cyan
    Write-Host "📡 URL: $Url" -ForegroundColor Gray
    Write-Host "📦 Payload: $body" -ForegroundColor Gray
    
    try {
        # Executar requisição
        $response = Invoke-RestMethod -Uri $Url -Method Post -ContentType "application/json" -Body $body -ErrorVariable restError
        
        # Verificar se é sucesso
        if ($response.success) {
            Write-Host "✅ Sucesso na resposta" -ForegroundColor Green
            Write-Host "🆔 Payment ID: $($response.data.paymentId)" -ForegroundColor Green
            
            # IMPORTANTE: Verificar QR code
            if ($response.data.qrCodeImage) {
                $qrCodeUrl = $response.data.qrCodeImage
                Write-Host "🖼️ QR Code presente: $($qrCodeUrl.Substring(0, [Math]::Min(50, $qrCodeUrl.Length)))..." -ForegroundColor Green
                
                # Verificar formato do QR code
                if ($qrCodeUrl.StartsWith("http")) {
                    Write-Host "✅ Formato QR Code: URL externa" -ForegroundColor Green
                    
                    # Salvar QR code como arquivo
                    $outputFile = "$outputFolder\${Environment}_${PaymentMethod}_${timestamp}.png"
                    Write-Host "💾 Salvando QR Code em: $outputFile" -ForegroundColor Yellow
                    
                    try {
                        Invoke-WebRequest -Uri $qrCodeUrl -OutFile $outputFile
                        if (Test-Path $outputFile) {
                            Write-Host "✅ QR Code salvo com sucesso!" -ForegroundColor Green
                            Write-Host "📊 Tamanho do arquivo: $((Get-Item $outputFile).Length) bytes" -ForegroundColor Gray
                        } else {
                            Write-Host "❌ Falha ao salvar QR Code" -ForegroundColor Red
                        }
                    } catch {
                        Write-Host "❌ Erro ao baixar QR Code: $_" -ForegroundColor Red
                    }
                } elseif ($qrCodeUrl.StartsWith("data:image")) {
                    Write-Host "✅ Formato QR Code: Base64 (ambiente local)" -ForegroundColor Green
                    
                    # Salvar QR code Base64 como arquivo
                    $outputFile = "$outputFolder\${Environment}_${PaymentMethod}_${timestamp}.txt"
                    Write-Host "💾 Salvando QR Code Base64 em: $outputFile" -ForegroundColor Yellow
                    $qrCodeUrl | Out-File $outputFile
                    Write-Host "✅ Dados Base64 salvos para análise" -ForegroundColor Green
                } else {
                    Write-Host "❓ Formato QR Code desconhecido" -ForegroundColor Yellow
                }
            } else {
                Write-Host "❌ QR Code AUSENTE na resposta!" -ForegroundColor Red
            }
            
            # Verificar outros campos importantes
            if ($PaymentMethod -eq "pix") {
                if ($response.data.pixCode) {
                    $pixCode = $response.data.pixCode
                    Write-Host "📝 Código PIX presente: $($pixCode.Substring(0, [Math]::Min(30, $pixCode.Length)))..." -ForegroundColor Green
                    
                    # Salvar código PIX
                    $pixFile = "$outputFolder\${Environment}_pix_code_${timestamp}.txt"
                    $pixCode | Out-File $pixFile
                    Write-Host "💾 Código PIX salvo em: $pixFile" -ForegroundColor Gray
                } else {
                    Write-Host "❌ Código PIX AUSENTE na resposta!" -ForegroundColor Red
                }
            } else {
                $bitcoinCode = $response.data.lightningInvoice -or $response.data.bitcoinUri
                if ($bitcoinCode) {
                    Write-Host "📝 Bitcoin Invoice/URI presente: $($bitcoinCode.Substring(0, [Math]::Min(30, $bitcoinCode.Length)))..." -ForegroundColor Green
                    
                    # Salvar código Bitcoin
                    $btcFile = "$outputFolder\${Environment}_bitcoin_code_${timestamp}.txt"
                    $bitcoinCode | Out-File $btcFile
                    Write-Host "💾 Código Bitcoin salvo em: $btcFile" -ForegroundColor Gray
                } else {
                    Write-Host "❌ Bitcoin Invoice/URI AUSENTE na resposta!" -ForegroundColor Red
                }
            }
            
            # Salvar resposta completa para análise
            $responseFile = "$outputFolder\${Environment}_${PaymentMethod}_response_${timestamp}.json"
            $response | ConvertTo-Json -Depth 10 | Out-File $responseFile
            Write-Host "📋 Resposta completa salva em: $responseFile" -ForegroundColor Gray
            
        } else {
            Write-Host "❌ Erro na resposta: $($response.error)" -ForegroundColor Red
        }
    } catch {
        if ($restError) {
            Write-Host "❌ Erro na requisição: $restError" -ForegroundColor Red
        } else {
            Write-Host "❌ Erro: $_" -ForegroundColor Red
        }
    }
}

Write-Host "🧪 TESTE DE DIAGNÓSTICO DA API DE QR CODE" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Verificar se o servidor local está rodando
$localServerRunning = $false
try {
    $null = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 2
    $localServerRunning = $true
} catch {
    Write-Host "⚠️ Servidor local não está rodando. Testando apenas produção." -ForegroundColor Yellow
}

# Testar ambiente local se estiver rodando
if ($localServerRunning) {
    Write-Host "`n🖥️ TESTANDO AMBIENTE LOCAL" -ForegroundColor Magenta
    Test-QRCodeApi -Url $localUrl -Environment "local" -PaymentMethod "pix"
    Test-QRCodeApi -Url $localUrl -Environment "local" -PaymentMethod "bitcoin"
}

# Testar ambiente de produção
Write-Host "`n🌐 TESTANDO AMBIENTE DE PRODUÇÃO" -ForegroundColor Magenta
Test-QRCodeApi -Url $productionUrl -Environment "prod" -PaymentMethod "pix"
Test-QRCodeApi -Url $productionUrl -Environment "prod" -PaymentMethod "bitcoin"

Write-Host "`n✅ TESTES CONCLUÍDOS" -ForegroundColor Green
Write-Host "📂 Resultados salvos em: $(Resolve-Path $outputFolder)" -ForegroundColor Cyan
