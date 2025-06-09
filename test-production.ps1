# 🧪 Teste de Produção - Vercel Deploy
# Verifica se a aplicação está funcionando na Vercel

Write-Host "🧪 TESTANDO APLICAÇÃO NA VERCEL" -ForegroundColor Cyan
Write-Host "=" * 50

$baseUrl = "https://livetip-webhook-integration.vercel.app"

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [string]$ExpectedContent = $null
    )
    
    Write-Host "`n🔍 Testando: $Name" -ForegroundColor Yellow
    Write-Host "   URL: $Url"
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
            
            if ($ExpectedContent -and $response.Content -like "*$ExpectedContent*") {
                Write-Host "   ✅ Conteúdo: Encontrado '$ExpectedContent'" -ForegroundColor Green
                return $true
            } elseif ($ExpectedContent) {
                Write-Host "   ❌ Conteúdo: Não encontrado '$ExpectedContent'" -ForegroundColor Red
                Write-Host "   📄 Primeiros 100 chars: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))..." -ForegroundColor Gray
                return $false
            } else {
                Write-Host "   ✅ Endpoint funcionando!" -ForegroundColor Green
                return $true
            }
        } else {
            Write-Host "   ❌ Status: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Lista de testes
$tests = @(
    @{ Name = "Página Principal"; Url = "$baseUrl/"; Content = "LiveTip" },
    @{ Name = "Health Check"; Url = "$baseUrl/health"; Content = "OK" },
    @{ Name = "Webhook Status"; Url = "$baseUrl/webhook"; Content = "Webhook" },
    @{ Name = "CSS Stylesheet"; Url = "$baseUrl/style.css"; Content = "body" },
    @{ Name = "JavaScript"; Url = "$baseUrl/script.js"; Content = "function" },
    @{ Name = "Control Page"; Url = "$baseUrl/control"; Content = "Controle" },
    @{ Name = "Webhook Monitor"; Url = "$baseUrl/webhook-monitor"; Content = "Monitor" }
)

# Executar testes
$passed = 0
$failed = 0

foreach ($test in $tests) {
    if (Test-Endpoint -Url $test.Url -Name $test.Name -ExpectedContent $test.Content) {
        $passed++
    } else {
        $failed++
    }
    Start-Sleep -Seconds 1
}

# Resultado final
Write-Host "`n" + "=" * 50
Write-Host "📊 RESULTADO FINAL" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host "✅ Passou: $passed/$($tests.Count)" -ForegroundColor Green
Write-Host "❌ Falhou: $failed/$($tests.Count)" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "`n🎉 DEPLOY VERCEL FUNCIONANDO PERFEITAMENTE!" -ForegroundColor Green
    Write-Host "✅ Todas as funcionalidades operacionais" -ForegroundColor Green
    Write-Host "🔗 URL: $baseUrl" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Alguns testes falharam" -ForegroundColor Yellow
    Write-Host "🔧 Verificar logs da Vercel para mais detalhes" -ForegroundColor Yellow
}

Write-Host "`n🌐 URLs importantes:" -ForegroundColor Cyan
Write-Host "   🏠 Aplicação: $baseUrl"
Write-Host "   💚 Health: $baseUrl/health"
Write-Host "   🎯 Webhook: $baseUrl/webhook"
Write-Host "   📊 Monitor: $baseUrl/webhook-monitor"
