# LiveTip Production Test
Write-Host "🧪 Testing LiveTip Production System" -ForegroundColor Green

$baseUrl = "https://livetip-webhook-integration.vercel.app"

# Test all endpoints
$endpoints = @(
    @{ path = "/"; name = "Home Page" },
    @{ path = "/health"; name = "Health Check" },
    @{ path = "/webhook"; name = "Webhook Status" },
    @{ path = "/control"; name = "Control Panel" },
    @{ path = "/webhook-monitor"; name = "Webhook Monitor" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "`nTesting $($endpoint.name): $baseUrl$($endpoint.path)" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$($endpoint.path)" -Method GET -TimeoutSec 10
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        if ($endpoint.path -eq "/health") {
            $json = $response.Content | ConvertFrom-Json
            Write-Host "   Health Status: $($json.status)" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test payment generation
Write-Host "`n🔥 Testing Payment Generation..." -ForegroundColor Yellow
try {
    $payload = @{
        userName = "TestUser"
        paymentMethod = "pix"
        amount = "25.50"
        uniqueId = "test_final_" + (Get-Date -Format "yyyyMMddHHmmss")
    } | ConvertTo-Json

    $headers = @{ 'Content-Type' = 'application/json' }
    $result = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -Body $payload -Headers $headers

    Write-Host "✅ Payment Generated!" -ForegroundColor Green
    Write-Host "   Payment ID: $($result.data.paymentId)" -ForegroundColor Cyan
    Write-Host "   Source: $($result.data.source)" -ForegroundColor Cyan
    Write-Host "   Amount: R$ $($result.data.amount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Payment Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Production Test Complete!" -ForegroundColor Green
