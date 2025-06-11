# Teste simples da API PIX
Write-Host "🧪 Testando API PIX..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    userName = "Teste"
    amount = 2
    paymentMethod = "pix"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://livetip-webhook-integration-bt91dbb6h.vercel.app/generate-qr" -Method POST -Body $body -Headers $headers -TimeoutSec 30
    
    Write-Host "✅ Resposta recebida:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    
    if ($response.success) {
        Write-Host "🎉 PIX gerado com sucesso!" -ForegroundColor Green
        Write-Host "Fonte: $($response.data.source)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erro: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro na requisição: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Response)" -ForegroundColor Gray
}
