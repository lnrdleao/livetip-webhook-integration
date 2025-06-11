$baseUrl = "https://livetip-webhook-integration-leonardos-projects-b4a462ee.vercel.app"

$pixPayload = @{
    userName = "Usuario Teste"
    amount = "1"
    paymentMethod = "pix"
} | ConvertTo-Json

Write-Host "PIX Test payload:" $pixPayload

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/generate-qr" -Method POST -ContentType "application/json" -Body $pixPayload
    Write-Host "Success: " $response.Content
} catch {
    Write-Host "Error: " $_.Exception.Message
    if ($_.Exception.Response) {
        $result = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($result)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Details: " $responseBody
    }
}
