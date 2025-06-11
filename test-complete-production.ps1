# Test Complete Production System - LiveTip Webhook Integration
Write-Host "FINAL TESTING Complete Production System..." -ForegroundColor Green

$baseUrl = "https://livetip-webhook-integration-leonardos-projects-b4a462ee.vercel.app"

# Test 1: Basic Health Check
Write-Host "`nHEALTH Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "SUCCESS Health Response:" -ForegroundColor Green
    $healthResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "ERROR Health Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: PIX Payment Generation
Write-Host "`nPIX Testing PIX Payment (R$ 3.00)..." -ForegroundColor Yellow
$pixPayload = @{
    userName = "Usuario Final PIX"
    amount = "3.00"
    paymentMethod = "pix"
} | ConvertTo-Json

try {
    $pixResponse = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -ContentType "application/json" -Body $pixPayload
    Write-Host "SUCCESS PIX Generated:" -ForegroundColor Green
    Write-Host "Payment ID: $($pixResponse.data.paymentId)" -ForegroundColor Cyan
    Write-Host "PIX Code: $($pixResponse.data.pixCode)" -ForegroundColor Cyan
    Write-Host "QR Image: $($pixResponse.data.qrCodeImage)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR PIX Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Bitcoin Payment Generation  
Write-Host "`nBTC Testing Bitcoin Payment (300 sats)..." -ForegroundColor Yellow
$bitcoinPayload = @{
    userName = "Usuario Final Bitcoin"
    amount = "300"
    paymentMethod = "bitcoin"
} | ConvertTo-Json

try {
    $bitcoinResponse = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -ContentType "application/json" -Body $bitcoinPayload
    Write-Host "SUCCESS Bitcoin Generated:" -ForegroundColor Green
    Write-Host "Payment ID: $($bitcoinResponse.data.paymentId)" -ForegroundColor Cyan
    Write-Host "Bitcoin URI: $($bitcoinResponse.data.bitcoinUri)" -ForegroundColor Cyan
    Write-Host "QR Image: $($bitcoinResponse.data.qrCodeImage)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR Bitcoin Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Check Payments History
Write-Host "`nSTATS Testing Payments History..." -ForegroundColor Yellow
try {
    $paymentsResponse = Invoke-RestMethod -Uri "$baseUrl/payments" -Method GET
    Write-Host "SUCCESS Payments Retrieved:" -ForegroundColor Green
    Write-Host "Total Payments: $($paymentsResponse.total)" -ForegroundColor Cyan
    $paymentsResponse.payments | ForEach-Object {
        Write-Host "- $($_.userName) | $($_.method) | $($_.amount) | $($_.createdAt)" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR Payments Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test Webhook Functionality
Write-Host "`nWEBHOOK Testing Webhook System..." -ForegroundColor Yellow
$webhookPayload = @{
    event = "payment_confirmed"
    payment = @{
        sender = "Test Webhook User"
        content = "Sistema de webhook funcionando"
        amount = 150
        currency = "BTC"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        paid = $true
        paymentId = "webhook_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
        read = $false
    }
} | ConvertTo-Json -Depth 3

try {
    $webhookResponse = Invoke-RestMethod -Uri "$baseUrl/test-webhook" -Method POST -ContentType "application/json" -Body $webhookPayload
    Write-Host "SUCCESS Webhook Test:" -ForegroundColor Green
    $webhookResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "ERROR Webhook Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Check Webhook Logs
Write-Host "`nLOGS Testing Webhook Logs..." -ForegroundColor Yellow
try {
    $logsResponse = Invoke-RestMethod -Uri "$baseUrl/webhook-logs?limit=10" -Method GET
    Write-Host "SUCCESS Webhook Logs:" -ForegroundColor Green
    Write-Host "Total Logs: $($logsResponse.total)" -ForegroundColor Cyan
    $logsResponse.logs | ForEach-Object {
        Write-Host "- $($_.event) | $($_.status) | $($_.timestamp)" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR Logs Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Check Webhook Stats
Write-Host "`nSTATS Testing Webhook Statistics..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/webhook-stats" -Method GET
    Write-Host "SUCCESS Webhook Stats:" -ForegroundColor Green
    $statsResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "ERROR Stats Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Test Control Panel
Write-Host "`nCONTROL Testing Control Panel..." -ForegroundColor Yellow
try {
    $controlResponse = Invoke-WebRequest -Uri "$baseUrl/control" -Method GET
    if ($controlResponse.StatusCode -eq 200) {
        Write-Host "SUCCESS Control Panel Accessible" -ForegroundColor Green
        Write-Host "Content Length: $($controlResponse.Content.Length) bytes" -ForegroundColor Cyan
    }
} catch {
    Write-Host "ERROR Control Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Test Webhook Monitor
Write-Host "`nMONITOR Testing Webhook Monitor..." -ForegroundColor Yellow
try {
    $monitorResponse = Invoke-WebRequest -Uri "$baseUrl/webhook-monitor" -Method GET
    if ($monitorResponse.StatusCode -eq 200) {
        Write-Host "SUCCESS Webhook Monitor Accessible" -ForegroundColor Green
        Write-Host "Content Length: $($monitorResponse.Content.Length) bytes" -ForegroundColor Cyan
    }
} catch {
    Write-Host "ERROR Monitor Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nFINAL All Production Tests Complete!" -ForegroundColor Cyan
Write-Host "Production URL: $baseUrl" -ForegroundColor White
Write-Host "Control Panel: $baseUrl/control" -ForegroundColor White  
Write-Host "Webhook Monitor: $baseUrl/webhook-monitor" -ForegroundColor White
