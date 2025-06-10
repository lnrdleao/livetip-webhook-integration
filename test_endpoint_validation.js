// Teste do endpoint /generate-qr com valores PIX fixos
const https = require('https');

const testEndpoint = async (paymentMethod, amount, userName) => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            userName,
            paymentMethod,
            amount,
            uniqueId: `test_${Date.now()}`
        });

        const options = {
            hostname: 'livetip-webhook-integration.vercel.app',
            port: 443,
            path: '/generate-qr',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ status: res.statusCode, data: response });
                } catch (error) {
                    resolve({ status: res.statusCode, data: { error: 'Invalid JSON', raw: data } });
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
};

const runTests = async () => {
    console.log('🧪 Testando endpoint /generate-qr\n');

    // Teste 1: PIX válidos (R$ 1, 2, 3, 4)
    console.log('=== TESTE PIX VÁLIDOS ===');
    for (const amount of [1, 2, 3, 4]) {
        try {
            const result = await testEndpoint('pix', amount, 'TestUser');
            console.log(`✅ PIX R$ ${amount}: Status ${result.status}`);
            
            if (result.data.success) {
                console.log(`   - PaymentId: ${result.data.data.paymentId}`);
                console.log(`   - Source: ${result.data.data.source}`);
                console.log(`   - PIX Code: ${result.data.data.pixCode ? 'Gerado' : 'Não gerado'}`);
            } else {
                console.log(`   - Erro: ${result.data.error}`);
            }
        } catch (error) {
            console.log(`❌ PIX R$ ${amount}: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s entre requests
    }

    // Teste 2: PIX inválido (R$ 5)
    console.log('\n=== TESTE PIX INVÁLIDO ===');
    try {
        const result = await testEndpoint('pix', 5, 'TestUser');
        console.log(`PIX R$ 5: Status ${result.status}`);
        console.log(`   - Erro esperado: ${result.data.error}`);
    } catch (error) {
        console.log(`❌ PIX R$ 5: ${error.message}`);
    }

    // Teste 3: Bitcoin
    console.log('\n=== TESTE BITCOIN ===');
    for (const amount of [1, 10, 50]) {
        try {
            const result = await testEndpoint('bitcoin', amount, 'TestUser');
            console.log(`✅ Bitcoin R$ ${amount}: Status ${result.status}`);
            
            if (result.data.success) {
                console.log(`   - PaymentId: ${result.data.data.paymentId}`);
                console.log(`   - Source: ${result.data.data.source}`);
                console.log(`   - Lightning: ${result.data.data.lightningInvoice ? 'Gerado' : 'Não gerado'}`);
                console.log(`   - Satoshis: ${result.data.data.satoshis}`);
            } else {
                console.log(`   - Erro: ${result.data.error}`);
            }
        } catch (error) {
            console.log(`❌ Bitcoin R$ ${amount}: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎯 Testes do endpoint concluídos!');
};

runTests().catch(console.error);
