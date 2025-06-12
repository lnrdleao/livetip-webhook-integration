# Test Production API - LiveTip Webhook Integration
Write-Host "ROCKET Testing Production API..." -ForegroundColor Green

$baseUrl = "https://livetip-webhook-integration-leonardos-projects-b4a462ee.vercel.app"

# Test 1: PIX Payment Generation
Write-Host "`nPIX Testing PIX Payment Generation..." -ForegroundColor Yellow

$pixPayload = @{
    userName = "Test User Production"
    amount = "2"
    paymentMethod = "pix"
} | ConvertTo-Json

try {
    $pixResponse = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -ContentType "application/json" -Body $pixPayload
    Write-Host "✅ PIX Response:" -ForegroundColor Green
    $pixResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ PIX Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

# Test 2: Bitcoin Payment Generation
Write-Host "`nBTC Testing Bitcoin Payment Generation..." -ForegroundColor Yellow

$bitcoinPayload = @{
    userName = "Test User Bitcoin"
    amount = "200"
    paymentMethod = "bitcoin"
} | ConvertTo-Json

try {
    $bitcoinResponse = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -ContentType "application/json" -Body $bitcoinPayload
    Write-Host "✅ Bitcoin Response:" -ForegroundColor Green
    $bitcoinResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Bitcoin Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Health Check
Write-Host "`nHEALTH Testing Health Check..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health Response:" -ForegroundColor Green
    $healthResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Health Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Payment History
Write-Host "`nSTATS Testing Payment History..." -ForegroundColor Yellow

try {
    $paymentsResponse = Invoke-RestMethod -Uri "$baseUrl/payments" -Method GET
    Write-Host "✅ Payments Response:" -ForegroundColor Green
    $paymentsResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Payments Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nSUCCESS Production API Tests Complete!" -ForegroundColor Cyan
