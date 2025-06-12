# Teste da API de QR Code em produção
Write-Host "🔍 Testando API de geração de QR code em produção" -ForegroundColor Cyan

# Dados para o teste
$payload = @{
    userName = "TesteProducao"
    paymentMethod = "pix"
    amount = 2
    uniqueId = "PIX_TEST_$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

$baseUrl = "https://livetip-webhook-integration-8qpbvn4w5.vercel.app"

# Mostrar detalhes da requisição
Write-Host "`nURL: $baseUrl/generate-qr" -ForegroundColor Yellow
Write-Host "Payload:" -ForegroundColor Yellow
Write-Host $payload

try {
    # Fazer a requisição
    Write-Host "`n📡 Enviando requisição..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "$baseUrl/generate-qr" -Method POST -ContentType "application/json" -Body $payload -ErrorAction Stop
    
    # Exibir resposta de sucesso
    Write-Host "`n✅ Resposta recebida com sucesso!" -ForegroundColor Green
    Write-Host "Estrutura da resposta:" -ForegroundColor Yellow
    $response | Format-List
    
    # Verificar se o QR code está presente
    if ($response.data.qrCodeImage) {
        Write-Host "`n🖼️ QR Code gerado com sucesso!" -ForegroundColor Green
        Write-Host "URL/Dados do QR Code (primeiros 100 caracteres): $($response.data.qrCodeImage.Substring(0, [Math]::Min(100, $response.data.qrCodeImage.Length)))..." -ForegroundColor Yellow
        
        # Verificar o tipo de QR Code (URL externa ou data URI)
        if ($response.data.qrCodeImage -like "data:image*") {
            Write-Host "Tipo: Data URI (gerado com canvas)" -ForegroundColor Green
        } elseif ($response.data.qrCodeImage -like "http*") {
            Write-Host "Tipo: URL externa (api.qrserver.com)" -ForegroundColor Yellow
        } else {
            Write-Host "Tipo: Desconhecido" -ForegroundColor Red
        }
    } else {
        Write-Host "`n❌ QR Code não encontrado na resposta!" -ForegroundColor Red
    }
    
} catch {
    # Manipular erros
    Write-Host "`n❌ Erro ao fazer requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        # Tentar ler o corpo da resposta para mais detalhes
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "`nDetalhes da resposta:" -ForegroundColor Yellow
            Write-Host $responseBody
        } catch {
            Write-Host "Não foi possível ler detalhes da resposta." -ForegroundColor Red
        }
    }
}
