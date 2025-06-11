// Teste simplificado da correção PIX
const https = require('https');

console.log('🔧 TESTE FINAL - CORREÇÃO PIX APLICADA');
console.log('=====================================');

// Função para testar a API
function testAPI(amount) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            userName: 'Teste Usuario',
            amount: amount,
            paymentMethod: 'pix'
        });

        const options = {
            hostname: 'livetip-webhook-integration-leonardos-projects-b4a462ee.vercel.app',
            port: 443,
            path: '/generate-qr',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({
                        status: res.statusCode,
                        success: response.success,
                        data: response
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        success: false,
                        error: 'Parse error: ' + e.message,
                        body: body
                    });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

// Executar teste
async function runTest() {
    console.log('\n💳 Testando PIX R$ 2,00...');
    
    try {
        const result = await testAPI(2);
        
        console.log('Status HTTP:', result.status);
        console.log('Sucesso:', result.success);
        
        if (result.success) {
            console.log('✅ PIX GERADO COM SUCESSO!');
            console.log('Payment ID:', result.data.data.paymentId);
            console.log('Fonte:', result.data.data.source);
            console.log('PIX Code válido:', result.data.data.pixCode ? 'Sim' : 'Não');
            console.log('\n🎉 CORREÇÃO CONFIRMADA!');
            console.log('✅ Sistema funcionando corretamente');
        } else {
            console.log('❌ ERRO:', result.data.error || 'Erro desconhecido');
            console.log('Detalhes:', JSON.stringify(result.data, null, 2));
        }
        
    } catch (error) {
        console.log('❌ ERRO NA REQUISIÇÃO:', error.message);
    }
}

runTest();
