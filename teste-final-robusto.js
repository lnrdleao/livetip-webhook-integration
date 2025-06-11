// Teste final definitivo para verificar se o erro foi corrigido
const https = require('https');

async function testPaymentRobust(paymentMethod, amount) {
    console.log(`\n🧪 Testando ${paymentMethod.toUpperCase()} - R$ ${amount}`);
    console.log('='.repeat(50));
    
    const testData = {
        userName: 'TesteRobusto',
        paymentMethod: paymentMethod,
        amount: amount,
        uniqueId: `robust_${paymentMethod}_${Date.now()}`
    };

    console.log('📡 Enviando requisição...');
    const postData = JSON.stringify(testData);
    
    const options = {
        hostname: 'livetip-webhook-integration.vercel.app',
        port: 443,
        path: '/generate-qr',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Teste-Final-Robusto/1.0'
        },
        timeout: 30000
    };

    return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log(`📥 Status: ${response.statusCode}`);
                console.log(`📥 Dados recebidos: ${data.length} bytes`);
                
                try {
                    const result = JSON.parse(data);
                    
                    if (result.success && result.data) {
                        console.log('✅ SUCESSO!');
                        console.log(`   🎯 Source: ${result.data.source}`);
                        console.log(`   🆔 Payment ID: ${result.data.paymentId}`);
                        console.log(`   👤 Usuário: ${result.data.userName}`);
                        console.log(`   💰 Valor: ${paymentMethod === 'pix' ? 'R$ ' : ''}${result.data.amount}${paymentMethod === 'bitcoin' ? ' sats' : ''}`);
                        
                        if (paymentMethod === 'pix' && result.data.pixCode) {
                            console.log(`   📄 PIX Code: ${result.data.pixCode.length} chars`);
                            console.log(`   📄 Preview: ${result.data.pixCode.substring(0, 60)}...`);
                            
                            // Validar formato PIX
                            const isValidPix = result.data.pixCode.length >= 50 && 
                                             (result.data.pixCode.startsWith('00020126') || 
                                              result.data.pixCode.includes('BR.GOV.BCB.PIX'));
                            console.log(`   ✔️ Formato PIX: ${isValidPix ? 'VÁLIDO' : 'INVÁLIDO'}`);
                        }
                        
                        if (paymentMethod === 'bitcoin' && result.data.lightningInvoice) {
                            console.log(`   ⚡ Lightning: ${result.data.lightningInvoice.substring(0, 60)}...`);
                        }
                        
                        // Verificar se está usando LiveTip API
                        if (result.data.source === 'livetip-api') {
                            console.log('   🎉 USANDO LIVETIP API - PERFEITO!');
                        } else {
                            console.log(`   ⚠️ Usando: ${result.data.source}`);
                        }
                        
                    } else {
                        console.log('❌ ERRO na resposta:');
                        console.log(`   📄 Error: ${result.error || 'Erro desconhecido'}`);
                        if (result.details) {
                            console.log(`   📋 Detalhes: ${result.details}`);
                        }
                    }
                    
                    resolve(result);
                } catch (parseError) {
                    console.log('❌ ERRO DE PARSE JSON:');
                    console.log(`   💥 Erro: ${parseError.message}`);
                    console.log(`   📄 Resposta raw: ${data.substring(0, 200)}...`);
                    
                    // Verificar se é erro HTML
                    if (data.trim().startsWith('<') || data.toLowerCase().includes('server error')) {
                        console.log('   🔍 Detectado: Resposta HTML de erro');
                    }
                    
                    reject(parseError);
                }
            });
        });

        request.on('timeout', () => { 
            console.log('❌ TIMEOUT da requisição');
            request.destroy(); 
            reject(new Error('Request timeout')); 
        });
        
        request.on('error', (error) => { 
            console.log('❌ ERRO na requisição:', error.message);
            reject(error); 
        });
        
        request.write(postData);
        request.end();
    });
}

async function runRobustTest() {
    console.log('🚀 TESTE FINAL ROBUSTO - VERIFICAÇÃO DE CORREÇÃO');
    console.log('='.repeat(60));
    console.log('Testando se o erro "Unexpected token A" foi corrigido...\n');

    let pixSuccess = false;
    let btcSuccess = false;
    let pixUsingApi = false;
    let btcUsingApi = false;

    try {
        // Teste PIX
        const pixResult = await testPaymentRobust('pix', '23.75');
        pixSuccess = pixResult.success === true;
        pixUsingApi = pixResult.data && pixResult.data.source === 'livetip-api';
        
        // Aguardar um momento
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Teste Bitcoin
        const btcResult = await testPaymentRobust('bitcoin', '750');
        btcSuccess = btcResult.success === true;
        btcUsingApi = btcResult.data && btcResult.data.source === 'livetip-api';
        
    } catch (error) {
        console.log('\n💥 ERRO durante os testes:', error.message);
    }

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL');
    console.log('='.repeat(60));
    console.log(`PIX Funcionando: ${pixSuccess ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`PIX usando API: ${pixUsingApi ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`Bitcoin Funcionando: ${btcSuccess ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`Bitcoin usando API: ${btcUsingApi ? '✅ SIM' : '❌ NÃO'}`);
    
    if (pixSuccess && btcSuccess) {
        console.log('\n🎊 CORREÇÃO APLICADA COM SUCESSO!');
        console.log('   ✅ Ambos os métodos de pagamento estão funcionando');
        console.log('   ✅ Erro "Unexpected token A" foi corrigido');
        
        if (pixUsingApi && btcUsingApi) {
            console.log('   ✅ Ambos estão usando LiveTip API');
            console.log('\n🏆 MISSÃO CUMPRIDA - SISTEMA TOTALMENTE FUNCIONAL!');
        } else {
            console.log('   ⚠️ Alguns ainda não estão usando LiveTip API');
        }
    } else {
        console.log('\n❌ AINDA HÁ PROBLEMAS:');
        if (!pixSuccess) console.log('   - PIX não está funcionando');
        if (!btcSuccess) console.log('   - Bitcoin não está funcionando');
    }
    
    console.log('\n🔗 URLs para testes:');
    console.log('   📋 Interface: https://livetip-webhook-integration.vercel.app/');
    console.log('   📊 Monitor: https://livetip-webhook-integration.vercel.app/webhook-monitor');
}

runRobustTest();
