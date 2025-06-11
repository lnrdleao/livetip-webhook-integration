# Teste PIX específico com valor 1 real
Write-Host "🧪 Testando PIX com valor válido..." -ForegroundColor Yellow

$baseUrl = "https://livetip-webhook-integration-leonardos-projects-b4a462ee.vercel.app"

$pixPayload = @{
    userName = "Usuario Teste"
    amount = "1.00"
    paymentMethod = "pix"
} | ConvertTo-Json

try {
    Write-Host "📡 Enviando payload PIX:" -ForegroundColor Cyan
    Write-Host $pixPayload -ForegroundColor Gray
    
    $pixResponse = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -ContentType "application/json" -Body $pixPayload
    Write-Host "✅ PIX Response:" -ForegroundColor Green
    $pixResponse | ConvertTo-Json -Depth 4
    
    # Verificar se está usando endpoint v10
    if ($pixResponse.data.source) {
        Write-Host "🔍 Source: $($pixResponse.data.source)" -ForegroundColor Magenta
    }
    if ($pixResponse.data.apiVersion) {
        Write-Host "🔍 API Version: $($pixResponse.data.apiVersion)" -ForegroundColor Magenta
    }
    if ($pixResponse.data.endpoint) {
        Write-Host "🔍 Endpoint: $($pixResponse.data.endpoint)" -ForegroundColor Magenta
    }
    
} catch {
    Write-Host "❌ PIX Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 PIX Test Complete!" -ForegroundColor Cyan
