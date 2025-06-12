// Teste da API de geração de QR code para pagamento PIX
const fetch = require('node-fetch');

// URLs para teste
const PRODUCTION_URL = 'https://livetip-webhook-integration-8qpbvn4w5.vercel.app';
const LOCAL_URL = 'http://localhost:3001';

// Dados para teste
const paymentData = {
    userName: "TesteDebug",
    paymentMethod: "pix",
    amount: 2,
    uniqueId: `PIX_TEST_${Date.now()}`
};

// Função para testar a geração do QR code
async function testQRCodeGeneration(baseUrl) {
    try {
        console.log(`\n🔍 Testando geração de QR code no ambiente: ${baseUrl}`);
        console.log(`📦 Dados de pagamento:`, paymentData);
        
        const startTime = Date.now();
        const response = await fetch(`${baseUrl}/generate-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
            timeout: 10000
        });
        
        const responseTime = Date.now() - startTime;
        
        // Primeiro, obter o texto da resposta para debug
        const responseText = await response.text();
        console.log(`📄 Resposta bruta (primeiros 300 caracteres):\n${responseText.substring(0, 300)}${responseText.length > 300 ? '...' : ''}`);
        
        // Tentar analisar como JSON se possível
        let data;
        try {
            data = JSON.parse(responseText);
            console.log(`✅ Resposta JSON analisada com sucesso (${responseTime}ms)`);
        } catch (parseError) {
            console.error(`❌ Erro ao analisar resposta como JSON: ${parseError.message}`);
            return;
        }
        
        // Verificar se a geração foi bem-sucedida
        if (data.success) {
            console.log('✅ Geração do QR code bem-sucedida!');
            console.log(`🆔 Payment ID: ${data.data?.paymentId || 'N/A'}`);
            
            if (data.data?.qrCodeImage) {
                console.log(`🖼️ QR Code gerado: ${data.data.qrCodeImage.substring(0, 50)}...`);
                console.log(`📊 Tipo de QR Code: ${data.data.qrCodeImage.includes('data:image') ? 'Base64 (canvas)' : 'URL (api externa)'}`);
            } else {
                console.error('❌ QR Code não encontrado na resposta!');
            }
            
            if (data.data?.pixCode) {
                console.log(`🔤 Código PIX: ${data.data.pixCode.substring(0, 30)}...`);
            }
        } else {
            console.error(`❌ Erro na geração do QR code: ${data.error || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error(`❌ Erro na requisição: ${error.message}`);
    }
}

// Executar os testes
async function runTests() {
    try {
        console.log('🧪 TESTE DA API DE GERAÇÃO DE QR CODE');
        console.log('==================================');
        
        // Testar ambiente local
        await testQRCodeGeneration(LOCAL_URL);
        
        // Testar ambiente de produção
        await testQRCodeGeneration(PRODUCTION_URL);
        
    } catch (error) {
        console.error(`❌ Erro geral no teste: ${error.message}`);
    }
}

// Iniciar os testes
runTests();
