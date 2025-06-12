# Teste API PIX v10 - Endpoint Oficial
Write-Host "🚀 Testing PIX API v10 - Official Endpoint" -ForegroundColor Green

$baseUrl = "https://livetip-webhook-integration-leonardos-projects-b4a462ee.vercel.app"

# Test PIX with correct values
$testValues = @("1", "2", "3", "4", "1.00", "2.00", "3.00", "4.00")

foreach ($amount in $testValues) {
    Write-Host "`n💰 Testing PIX Amount: R$ $amount" -ForegroundColor Yellow
    
    $pixPayload = @{
        userName = "Usuario Test PIX"
        amount = $amount
        paymentMethod = "pix"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -ContentType "application/json" -Body $pixPayload
        
        if ($response.success) {
            Write-Host "✅ SUCCESS - Amount: R$ $amount" -ForegroundColor Green
            Write-Host "   Source: $($response.data.source)" -ForegroundColor Cyan
            Write-Host "   API Version: $($response.data.apiVersion)" -ForegroundColor Cyan
            Write-Host "   Endpoint: $($response.data.endpoint)" -ForegroundColor Cyan
            Write-Host "   PIX Code Length: $($response.data.pixCode.Length) chars" -ForegroundColor Cyan
            
            # Verificar se é código PIX válido
            if ($response.data.pixCode -like "00020126*" -or $response.data.pixCode -like "*BR.GOV.BCB.PIX*") {
                Write-Host "   ✅ Valid PIX EMV Format" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️ Possible Invalid PIX Format" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ FAILED - Amount: R$ $amount" -ForegroundColor Red
            Write-Host "   Error: $($response.error)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ ERROR - Amount: R$ $amount" -ForegroundColor Red
        Write-Host "   Exception: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 PIX API v10 Tests Complete!" -ForegroundColor Magenta
