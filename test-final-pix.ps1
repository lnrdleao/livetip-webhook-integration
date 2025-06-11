# Teste final da correção PIX aplicada
Write-Host "🔧 TESTE FINAL - CORREÇÃO PIX" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

$apiUrl = "https://livetip-webhook-integration-leonardos-projects-b4a462ee.vercel.app/generate-qr"

function Test-PixValue {
    param([decimal]$amount, [string]$description)
    
    Write-Host "`n💳 Testando $description (R$ $amount)..." -ForegroundColor Cyan
    
    $body = @{
        userName = "Teste Usuario"
        amount = $amount
        paymentMethod = "pix"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            
            if ($data.success) {
                Write-Host "✅ SUCESSO!" -ForegroundColor Green
                Write-Host "   Payment ID: $($data.data.paymentId)" -ForegroundColor Gray
                Write-Host "   Fonte: $($data.data.source)" -ForegroundColor Gray
                Write-Host "   PIX válido: $($data.data.pixCode.Length -gt 50)" -ForegroundColor Gray
                return $true
            } else {
                Write-Host "❌ ERRO: $($data.error)" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "❌ HTTP $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ EXCEÇÃO: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Testes dos valores válidos
Write-Host "`n🎯 VALORES VÁLIDOS (devem passar):" -ForegroundColor Magenta
$sucessos = 0
$sucessos += if (Test-PixValue -amount 1 -description "Valor mínimo") { 1 } else { 0 }
Start-Sleep 2
$sucessos += if (Test-PixValue -amount 2 -description "Valor médio") { 1 } else { 0 }
Start-Sleep 2  
$sucessos += if (Test-PixValue -amount 3 -description "Valor alto") { 1 } else { 0 }
Start-Sleep 2
$sucessos += if (Test-PixValue -amount 4 -description "Valor máximo") { 1 } else { 0 }

# Resultado
Write-Host "`n📊 RESULTADO FINAL:" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host "✅ Valores aprovados: $sucessos/4" -ForegroundColor $(if ($sucessos -eq 4) { "Green" } else { "Red" })

if ($sucessos -eq 4) {
    Write-Host "`n🎉 CORREÇÃO PIX CONFIRMADA!" -ForegroundColor Green
    Write-Host "✅ Todos os valores PIX válidos foram aprovados" -ForegroundColor Green
    Write-Host "✅ Sistema está funcionando corretamente" -ForegroundColor Green
    Write-Host "✅ Deploy em produção está operacional" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ AINDA HÁ PROBLEMAS!" -ForegroundColor Red
    Write-Host "Apenas $sucessos de 4 valores foram aceitos" -ForegroundColor Red
}

Write-Host "`n🌐 URL de produção: $apiUrl" -ForegroundColor Cyan
