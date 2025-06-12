// Script de teste para verificar a resposta da API de QR code
const fetch = require('node-fetch');

// Configurações de teste
const URL_PRODUCTION = 'https://livetip-webhook-integration-8qpbvn4w5.vercel.app/generate-qr';
const URL_LOCAL = 'http://localhost:3001/generate-qr';

// Dados para teste - tanto PIX quanto Bitcoin
const testCases = [
    {
        description: "PIX - Valor R$ 2", 
        payload: {
            userName: "TesteDiagnostico",
            paymentMethod: "pix",
            amount: 2,
            uniqueId: `PIX_TEST_${Date.now()}`
        }
    },
    {
        description: "Bitcoin - Valor 1000 satoshis",
        payload: {
            userName: "TesteDiagnostico",
            paymentMethod: "bitcoin",
            amount: 1000,
            uniqueId: `BTC_TEST_${Date.now()}`
        }
    }
];

// Testar API
async function testApi(url, testCase) {
    console.log(`\n🔍 TESTE: ${testCase.description}`);
    console.log(`📡 URL: ${url}`);
    console.log(`📦 Payload: ${JSON.stringify(testCase.payload)}`);
    
    try {
        // Enviar requisição
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testCase.payload)
        });
        
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        // Obter resposta como texto para análise detalhada
        const responseText = await response.text();
        console.log(`📄 Resposta bruta (primeiros 200 caracteres):\n${responseText.substring(0, 200)}...`);
        
        try {
            // Analisar como JSON
            const data = JSON.parse(responseText);
            
            // Verificar se é sucesso
            if (data.success) {
                console.log(`✅ Sucesso: ${data.success}`);
                console.log(`🆔 Payment ID: ${data.data?.paymentId || 'N/A'}`);
                
                // IMPORTANTE: Verificar QR code
                if (data.data?.qrCodeImage) {
                    console.log(`🖼️ QR Code presente: ${data.data.qrCodeImage.substring(0, 50)}...`);
                    
                    // Verificar formato do QR code
                    if (data.data.qrCodeImage.startsWith('http')) {
                        console.log(`✅ Formato QR Code: URL externa (correto para produção)`);
                        
                        // Testar acesso à URL
                        try {
                            const qrResponse = await fetch(data.data.qrCodeImage, { method: 'HEAD' });
                            if (qrResponse.ok) {
                                console.log(`✅ QR Code acessível: ${qrResponse.status} ${qrResponse.statusText}`);
                            } else {
                                console.log(`❌ QR Code inacessível: ${qrResponse.status} ${qrResponse.statusText}`);
                            }
                        } catch (fetchError) {
                            console.log(`❌ Erro ao acessar QR Code: ${fetchError.message}`);
                        }
                    } else if (data.data.qrCodeImage.startsWith('data:image')) {
                        console.log(`✅ Formato QR Code: Base64 (correto para ambiente local)`);
                    } else {
                        console.log(`❓ Formato QR Code desconhecido`);
                    }
                } else {
                    console.log(`❌ QR Code AUSENTE na resposta!`);
                }
                
                // Verificar outros campos importantes
                if (testCase.payload.paymentMethod === 'pix') {
                    if (data.data?.pixCode) {
                        console.log(`📝 Código PIX presente: ${data.data.pixCode.substring(0, 30)}...`);
                    } else {
                        console.log(`❌ Código PIX AUSENTE na resposta!`);
                    }
                } else if (testCase.payload.paymentMethod === 'bitcoin') {
                    if (data.data?.lightningInvoice || data.data?.bitcoinUri) {
                        console.log(`📝 Bitcoin Invoice/URI presente: ${(data.data.lightningInvoice || data.data.bitcoinUri).substring(0, 30)}...`);
                    } else {
                        console.log(`❌ Bitcoin Invoice/URI AUSENTE na resposta!`);
                    }
                }
            } else {
                console.log(`❌ Erro na resposta: ${data.error || 'Erro não especificado'}`);
            }
        } catch (jsonError) {
            console.log(`❌ Erro ao analisar resposta como JSON: ${jsonError.message}`);
        }
    } catch (error) {
        console.log(`❌ Erro na requisição: ${error.message}`);
    }
}

// Função principal de teste
async function runTests() {
    console.log('🧪 TESTE DE DIAGNÓSTICO DA API DE QR CODE');
    console.log('===================================');
    
    // Testar ambiente local
    console.log('\n🖥️ TESTANDO AMBIENTE LOCAL');
    for (const testCase of testCases) {
        await testApi(URL_LOCAL, testCase);
    }
    
    // Testar ambiente de produção
    console.log('\n🌐 TESTANDO AMBIENTE DE PRODUÇÃO');
    for (const testCase of testCases) {
        await testApi(URL_PRODUCTION, testCase);
    }
    
    console.log('\n✅ TESTES CONCLUÍDOS');
}

// Executar testes
runTests().catch(error => {
    console.error('❌ Erro fatal:', error);
});
