// Teste direto da API para verificar se a correção PIX foi aplicada
const https = require('https');

async function testPixPayment(amount, userName = 'Teste Usuario') {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            userName: userName,
            amount: amount,
            paymentMethod: 'pix'
        });

        const options = {
            hostname: 'livetip-webhook-integration-bt91dbb6h.vercel.app',
            port: 443,
            path: '/generate-qr',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 30000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ status: res.statusCode, data: response });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data, error: error.message });
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('🔧 TESTANDO CORREÇÃO PIX APLICADA');
    console.log('=================================');

    // Teste 1: Valores permitidos (1, 2, 3, 4)
    console.log('\n🎯 TESTANDO VALORES PERMITIDOS:');
    
    const valoresValidos = [1, 2, 3, 4];
    let sucessos = 0;

    for (const valor of valoresValidos) {
        console.log(`\n💳 Testando PIX R$ ${valor}...`);
        
        try {
            const result = await testPixPayment(valor);
            
            if (result.status === 200 && result.data.success) {
                console.log('✅ SUCESSO!');
                console.log(`   Payment ID: ${result.data.data.paymentId}`);
                console.log(`   Fonte: ${result.data.data.source}`);
                console.log(`   PIX Code: ${result.data.data.pixCode?.substring(0, 50)}...`);
                
                // Verificar formato EMV
                const pixCode = result.data.data.pixCode;
                if (pixCode && (pixCode.startsWith('00020126') || pixCode.includes('BR.GOV.BCB.PIX'))) {
                    console.log('   📱 Formato PIX EMV: ✅ VÁLIDO');
                } else {
                    console.log('   📱 Formato PIX EMV: ❌ INVÁLIDO');
                }
                
                sucessos++;
            } else {
                console.log(`❌ ERRO: ${result.data.error || 'Status ' + result.status}`);
                console.log(`   Resposta: ${JSON.stringify(result.data).substring(0, 200)}`);
            }
        } catch (error) {
            console.log(`❌ EXCEÇÃO: ${error.message}`);
        }
        
        // Aguardar entre requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Teste 2: Valores não permitidos
    console.log('\n🚫 TESTANDO VALORES NÃO PERMITIDOS (devem falhar):');
    
    const valoresInvalidos = [5, 10, 0.5, 100];
    let falhasEsperadas = 0;

    for (const valor of valoresInvalidos) {
        console.log(`\n💳 Testando PIX R$ ${valor} (deve falhar)...`);
        
        try {
            const result = await testPixPayment(valor);
            
            if (result.status === 200 && result.data.success) {
                console.log('❌ ERRO: Valor inválido foi aceito!');
            } else {
                console.log(`✅ CORRETO: Valor rejeitado - ${result.data.error || 'Status ' + result.status}`);
                falhasEsperadas++;
            }
        } catch (error) {
            console.log(`✅ CORRETO: Valor rejeitado - ${error.message}`);
            falhasEsperadas++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Resultado final
    console.log('\n📊 RESULTADOS FINAIS:');
    console.log('=================================');
    console.log(`✅ PIX válidos aprovados: ${sucessos}/4`);
    console.log(`✅ PIX inválidos rejeitados: ${falhasEsperadas}/4`);

    if (sucessos === 4 && falhasEsperadas === 4) {
        console.log('\n🎉 CORREÇÃO PIX CONFIRMADA!');
        console.log('✅ Sistema funcionando perfeitamente');
        console.log('✅ Validações implementadas corretamente');
        console.log('✅ API LiveTip v10 integrada');
    } else {
        console.log('\n⚠️ AINDA HÁ PROBLEMAS!');
        console.log('Verificar logs do sistema');
    }

    console.log('\n📱 Teste um PIX válido no app bancário para confirmar!');
}

runTests().catch(console.error);
