// TESTE RÁPIDO - Verificar se endpoints /control e /webhook-monitor estão funcionando
const https = require('https');

async function testEndpoint(endpoint) {
    return new Promise((resolve, reject) => {
        console.log(`🧪 Testando ${endpoint}...`);
        
        const options = {
            hostname: 'livetip-webhook-integration.vercel.app',
            port: 443,
            path: endpoint,
            method: 'GET',
            timeout: 15000
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log(`📥 ${endpoint} - Status: ${response.statusCode}`);
                
                if (response.statusCode === 200) {
                    // Verificar se é HTML válido
                    if (data.includes('<!DOCTYPE html>') && data.includes('</html>')) {
                        console.log(`✅ ${endpoint} - HTML válido retornado`);
                        
                        // Verificar conteúdo específico
                        if (endpoint === '/control' && data.includes('Controle de Pagamentos')) {
                            console.log(`✅ ${endpoint} - Conteúdo correto detectado`);
                        } else if (endpoint === '/webhook-monitor' && data.includes('Webhook Monitor')) {
                            console.log(`✅ ${endpoint} - Conteúdo correto detectado`);
                        }
                    } else {
                        console.log(`⚠️ ${endpoint} - Resposta não é HTML válido`);
                    }
                } else if (response.statusCode === 500) {
                    console.log(`❌ ${endpoint} - ERRO 500 (Function crash)`);
                } else {
                    console.log(`⚠️ ${endpoint} - Status inesperado: ${response.statusCode}`);
                }
                
                resolve({ endpoint, status: response.statusCode, data: data.substring(0, 200) });
            });
        });

        request.on('timeout', () => { 
            request.destroy(); 
            console.log(`❌ ${endpoint} - Timeout`);
            reject(new Error('Timeout')); 
        });
        
        request.on('error', (error) => { 
            console.log(`❌ ${endpoint} - Erro: ${error.message}`);
            reject(error); 
        });
        
        request.end();
    });
}

async function testEndpoints() {
    console.log('🚀 TESTE DE ENDPOINTS - CORREÇÃO 500 ERROR');
    console.log('===========================================');
    
    try {
        // Aguardar um pouco para o deploy propagar
        console.log('⏳ Aguardando deploy propagar (5 segundos)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Testar endpoints
        console.log('\n🧪 Testando endpoints...');
        
        const results = await Promise.all([
            testEndpoint('/'),
            testEndpoint('/control'),
            testEndpoint('/webhook-monitor'),
            testEndpoint('/webhook')
        ]);
        
        console.log('\n📊 RESUMO DOS TESTES:');
        console.log('======================');
        
        let allWorking = true;
        results.forEach(result => {
            const status = result.status === 200 ? '✅ OK' : 
                          result.status === 500 ? '❌ ERRO 500' : 
                          `⚠️ ${result.status}`;
            console.log(`${result.endpoint}: ${status}`);
            
            if (result.status !== 200) {
                allWorking = false;
            }
        });
        
        if (allWorking) {
            console.log('\n🎉 TODOS OS ENDPOINTS FUNCIONANDO!');
            console.log('✅ O erro 500 foi corrigido com sucesso!');
        } else {
            console.log('\n⚠️ Alguns endpoints ainda têm problemas.');
            console.log('💡 Pode precisar de mais tempo para o deploy propagar.');
        }
        
    } catch (error) {
        console.log('\n❌ Erro durante os testes:', error.message);
    }
}

testEndpoints();
