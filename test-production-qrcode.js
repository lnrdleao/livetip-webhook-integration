// Teste da API de geração de QR code para pagamento PIX em produção
const fetch = require('node-fetch');

// URL de produção
const PRODUCTION_URL = 'https://livetip-webhook-integration-8qpbvn4w5.vercel.app';

// Dados para teste
const paymentData = {
    userName: "TesteProducao",
    paymentMethod: "pix",
    amount: 2,
    uniqueId: `PIX_TEST_${Date.now()}`
};

// Função para testar a geração do QR code na produção
async function testProductionQRCodeGeneration() {
    try {
        console.log(`\n🔍 Testando geração de QR code na produção: ${PRODUCTION_URL}`);
        console.log(`📦 Dados de pagamento:`, paymentData);
        
        const startTime = Date.now();
        const response = await fetch(`${PRODUCTION_URL}/generate-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
            timeout: 15000
        });
        
        const responseTime = Date.now() - startTime;
        const status = response.status;
        console.log(`📊 Status da resposta: ${status} (${responseTime}ms)`);
        
        if (status !== 200) {
            console.log(`⚠️ Resposta não-200 recebida. Status: ${status}`);
        }
        
        // Obter o texto da resposta para debug
        const responseText = await response.text();
        console.log(`📄 Resposta bruta (primeiros 500 caracteres):`);
        console.log(responseText.substring(0, 500));
        if (responseText.length > 500) console.log('...');
        
        // Tentar analisar como JSON se possível
        if (responseText.trim().startsWith('{')) {
            try {
                const data = JSON.parse(responseText);
                console.log(`\n✅ Resposta JSON analisada com sucesso`);
                
                // Verificar se a geração foi bem-sucedida
                if (data.success) {
                    console.log('✅ Geração do QR code bem-sucedida!');
                    console.log(`🆔 Payment ID: ${data.data?.paymentId || data.paymentId || 'N/A'}`);
                    
                    const qrImage = data.data?.qrCodeImage || data.qrCodeImage;
                    if (qrImage) {
                        console.log(`🖼️ QR Code presente: Sim`);
                        console.log(`📊 Tipo de QR Code: ${qrImage.includes('data:image') ? 'Base64 (canvas)' : 'URL (api externa)'}`);
                    } else {
                        console.error('❌ QR Code não encontrado na resposta!');
                    }
                } else {
                    console.error(`❌ Erro na geração do QR code: ${data.error || 'Erro desconhecido'}`);
                }
            } catch (parseError) {
                console.error(`❌ Erro ao analisar resposta como JSON: ${parseError.message}`);
            }
        } else {
            console.log('⚠️ A resposta não parece ser JSON. Possivelmente uma página HTML ou erro.');
        }
    } catch (error) {
        console.error(`❌ Erro na requisição: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Dica: Verifique se o servidor está rodando na URL especificada');
        }
    }
}

// Executar o teste
testProductionQRCodeGeneration();
