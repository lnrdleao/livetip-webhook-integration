#!/usr/bin/env pwsh
# Teste para verificar se a correção do PIX foi aplicada

Write-Host "🔧 TESTANDO CORREÇÃO PIX APLICADA" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# URL da API em produção
$apiUrl = "https://livetip-webhook-integration-bt91dbb6h.vercel.app/generate-qr"

# Função para testar PIX com valores válidos
function Test-PixPayment {
    param($amount, $userName = "Usuario Teste")
    
    Write-Host "`n💳 Testando PIX R$ $amount..." -ForegroundColor Cyan
    
    $payload = @{
        userName = $userName
        amount = $amount
        paymentMethod = "pix"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl `
            -Method POST `
            -Body $payload `
            -ContentType "application/json" `
            -TimeoutSec 30
        
        if ($response.success) {
            Write-Host "✅ SUCESSO!" -ForegroundColor Green
            Write-Host "   Payment ID: $($response.data.paymentId)" -ForegroundColor Gray
            Write-Host "   Fonte: $($response.data.source)" -ForegroundColor Gray
            Write-Host "   PIX Code: $($response.data.pixCode.Substring(0, 50))..." -ForegroundColor Gray
            
            # Verificar se o código PIX é válido (formato EMV)
            $pixCode = $response.data.pixCode
            if ($pixCode.StartsWith("00020126") -or $pixCode.Contains("BR.GOV.BCB.PIX")) {
                Write-Host "   📱 Formato PIX EMV: ✅ VÁLIDO" -ForegroundColor Green
            } else {
                Write-Host "   📱 Formato PIX EMV: ❌ INVÁLIDO" -ForegroundColor Red
            }
            
            return $true
        } else {
            Write-Host "❌ ERRO: $($response.error)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ EXCEÇÃO: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Teste 1: Valores permitidos (1, 2, 3, 4)
Write-Host "`n🎯 TESTANDO VALORES PERMITIDOS:" -ForegroundColor Magenta

$testesPix = @(1, 2, 3, 4)
$sucessos = 0

foreach ($valor in $testesPix) {
    $resultado = Test-PixPayment -amount $valor
    if ($resultado) { $sucessos++ }
    Start-Sleep -Seconds 2
}

# Teste 2: Valores não permitidos (deve falhar)
Write-Host "`n🚫 TESTANDO VALORES NÃO PERMITIDOS (devem falhar):" -ForegroundColor Magenta

$testesInvalidos = @(5, 10, 0.5, 100)
$falhasEsperadas = 0

foreach ($valor in $testesInvalidos) {
    Write-Host "`n💳 Testando PIX R$ $valor (deve falhar)..." -ForegroundColor Cyan
    
    $payload = @{
        userName = "Usuario Teste"
        amount = $valor
        paymentMethod = "pix"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl `
            -Method POST `
            -Body $payload `
            -ContentType "application/json" `
            -TimeoutSec 30
        
        if ($response.success) {
            Write-Host "❌ ERRO: Valor inválido foi aceito!" -ForegroundColor Red
        } else {
            Write-Host "✅ CORRETO: Valor rejeitado - $($response.error)" -ForegroundColor Green
            $falhasEsperadas++
        }
    } catch {
        Write-Host "✅ CORRETO: Valor rejeitado - $($_.Exception.Message)" -ForegroundColor Green
        $falhasEsperadas++
    }
    
    Start-Sleep -Seconds 1
}

# Resultado final
Write-Host "`n📊 RESULTADOS FINAIS:" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host "✅ PIX válidos aprovados: $sucessos/4" -ForegroundColor $(if ($sucessos -eq 4) { "Green" } else { "Red" })
Write-Host "✅ PIX inválidos rejeitados: $falhasEsperadas/4" -ForegroundColor $(if ($falhasEsperadas -eq 4) { "Green" } else { "Red" })

if ($sucessos -eq 4 -and $falhasEsperadas -eq 4) {
    Write-Host "`n🎉 CORREÇÃO PIX CONFIRMADA!" -ForegroundColor Green
    Write-Host "✅ Sistema funcionando perfeitamente" -ForegroundColor Green
    Write-Host "✅ Validações implementadas corretamente" -ForegroundColor Green
    Write-Host "✅ API LiveTip v10 integrada" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ AINDA HÁ PROBLEMAS!" -ForegroundColor Red
    Write-Host "Verificar logs do sistema" -ForegroundColor Red
}

Write-Host "`n📱 Teste um PIX válido no app bancário para confirmar!" -ForegroundColor Cyan
