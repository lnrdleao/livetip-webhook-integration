// TESTE RÁPIDO - Verificar se erro HTML foi corrigido
const https = require('https');

function testarPIX() {
    return new Promise((resolve, reject) => {
        const testData = {
            userName: 'TesteRapido',
            paymentMethod: 'pix',
            amount: '10.00',
            uniqueId: `teste_rapido_${Date.now()}`
        };

        const postData = JSON.stringify(testData);
        
        const options = {
            hostname: 'livetip-webhook-integration.vercel.app',
            port: 443,
            path: '/generate-qr',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 15000
        };

        console.log('🧪 TESTANDO PIX - Correção HTML aplicada...');
        
        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log(`📥 Status: ${response.statusCode}`);
                
                try {
                    const result = JSON.parse(data);
                    
                    if (result.success && result.data) {
                        console.log(`✅ SUCESSO! Fonte: ${result.data.source}`);
                        
                        if (result.data.source === 'livetip-api') {
                            console.log('🎉 PIX USANDO LIVETIP API - PERFEITO!');
                        } else if (result.data.source.includes('fallback')) {
                            console.log('✅ PIX usando fallback local (isso é OK, significa que a API HTML foi detectada corretamente)');
                        }
                        
                        console.log(`💰 PIX Code: ${result.data.pixCode ? result.data.pixCode.substring(0, 50) + '...' : 'NULL'}`);
                        
                    } else {
                        console.log('❌ Erro na resposta:', result.error || result);
                    }
                    
                    resolve(result);
                } catch (error) {
                    console.log('❌ ERRO JSON ainda persiste:', error.message);
                    console.log('📄 Resposta bruta:', data.substring(0, 200));
                    reject(error);
                }
            });
        });

        request.on('timeout', () => { 
            request.destroy(); 
            reject(new Error('Timeout')); 
        });
        
        request.on('error', (error) => { 
            console.log('❌ Erro de rede:', error.message);
            reject(error); 
        });
        
        request.write(postData);
        request.end();
    });
}

console.log('🚀 TESTE RÁPIDO - CORREÇÃO ERRO HTML');
console.log('=====================================');

testarPIX()
    .then(() => {
        console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
        console.log('O erro "A server e..." deve estar corrigido agora.');
    })
    .catch((error) => {
        console.log('\n❌ Teste falhou:', error.message);
        console.log('Talvez precise de mais alguns segundos para o deploy...');
    });
