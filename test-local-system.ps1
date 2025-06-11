# LiveTip Local System Test
Write-Host "🧪 Testing Local LiveTip System" -ForegroundColor Green

$localUrl = "http://localhost:3000"

# Test endpoints
$endpoints = @(
    @{ path = "/health"; name = "Health Check" },
    @{ path = "/webhook"; name = "Webhook Status" },
    @{ path = "/"; name = "Home Page" },
    @{ path = "/control"; name = "Control Panel" },
    @{ path = "/webhook-monitor"; name = "Monitor Panel" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "`nTesting $($endpoint.name): $localUrl$($endpoint.path)" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$localUrl$($endpoint.path)" -Method GET -TimeoutSec 5
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($endpoint.path -eq "/health") {
            try {
                $json = $response.Content | ConvertFrom-Json
                Write-Host "   Health Status: $($json.status)" -ForegroundColor Cyan
            } catch {
                Write-Host "   Raw response received" -ForegroundColor Cyan
            }
        }
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test payment generation
Write-Host "`n🔥 Testing PIX Payment Generation..." -ForegroundColor Yellow
try {
    $pixPayload = @{
        userName = "TestLocal"
        paymentMethod = "pix"
        amount = "15.75"
        uniqueId = "local_test_" + (Get-Date -Format "yyyyMMddHHmmss")
    } | ConvertTo-Json

    $headers = @{ 'Content-Type' = 'application/json' }
    $result = Invoke-RestMethod -Uri "$localUrl/generate-qr" -Method POST -Body $pixPayload -Headers $headers -TimeoutSec 10

    Write-Host "✅ PIX Payment Generated!" -ForegroundColor Green
    Write-Host "   Payment ID: $($result.data.paymentId)" -ForegroundColor Cyan
    Write-Host "   Source: $($result.data.source)" -ForegroundColor Cyan
    Write-Host "   Amount: R$ $($result.data.amount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ PIX Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Bitcoin payment generation
Write-Host "`n🔥 Testing Bitcoin Payment Generation..." -ForegroundColor Yellow
try {
    $btcPayload = @{
        userName = "TestLocal"
        paymentMethod = "bitcoin"
        amount = "2100"
        uniqueId = "local_btc_" + (Get-Date -Format "yyyyMMddHHmmss")
    } | ConvertTo-Json

    $btcResult = Invoke-RestMethod -Uri "$localUrl/generate-qr" -Method POST -Body $btcPayload -Headers $headers -TimeoutSec 10

    Write-Host "✅ Bitcoin Payment Generated!" -ForegroundColor Green
    Write-Host "   Payment ID: $($btcResult.data.paymentId)" -ForegroundColor Cyan
    Write-Host "   Source: $($btcResult.data.source)" -ForegroundColor Cyan
    Write-Host "   Amount: $($btcResult.data.amount) sats" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Bitcoin Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Local System Test Complete!" -ForegroundColor Green
