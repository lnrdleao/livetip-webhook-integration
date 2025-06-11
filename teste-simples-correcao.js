// Teste simples e direto para confirmar que o erro foi corrigido
const https = require('https');

function testeSimples() {
    console.log('🔧 TESTE DIRETO - Verificando se erro foi corrigido...\n');
    
    const dados = {
        userName: 'TesteCorreção',
        paymentMethod: 'pix',
        amount: '15.50',
        uniqueId: `teste_correcao_${Date.now()}`
    };

    const postData = JSON.stringify(dados);
    
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

    console.log('📡 Enviando requisição PIX...');
    
    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            console.log(`📥 Status: ${response.statusCode}`);
            
            try {
                const result = JSON.parse(data);
                console.log('✅ SUCESSO! JSON parseado sem erros');
                console.log(`✅ Success: ${result.success}`);
                
                if (result.success && result.data) {
                    console.log(`✅ Source: ${result.data.source}`);
                    console.log(`✅ PIX Code: ${result.data.pixCode ? 'Gerado (' + result.data.pixCode.length + ' chars)' : 'NULL'}`);
                    console.log('\n🎉 CORREÇÃO APLICADA COM SUCESSO!');
                    console.log('   ✓ Erro "Unexpected token A" foi resolvido');
                    console.log('   ✓ JSON parsing funcionando perfeitamente');
                } else {
                    console.log('⚠️ Resposta recebida mas com erro:', result.error);
                }
                
            } catch (parseError) {
                console.log('❌ AINDA HÁ ERRO DE JSON PARSE:', parseError.message);
                console.log('❌ Raw response:', data.substring(0, 200));
                console.log('\n🔧 A correção precisa ser revista...');
            }
        });
    });

    request.on('timeout', () => { 
        console.log('❌ Timeout da requisição');
        request.destroy(); 
    });
    
    request.on('error', (error) => { 
        console.log('❌ Erro na requisição:', error.message);
    });
    
    request.write(postData);
    request.end();
}

testeSimples();
