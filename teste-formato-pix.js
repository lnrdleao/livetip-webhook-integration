// Teste para verificar a correção do formato do código PIX
const http = require('http');
const fs = require('fs');

console.log('🔍 VERIFICAÇÃO DO FORMATO DO CÓDIGO PIX');
console.log('====================================');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/create-payment',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const data = JSON.stringify({
    userName: 'Teste Formato PIX',
    paymentMethod: 'pix',
    amount: 2
});

const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        try {
            const result = JSON.parse(responseData);
            console.log('✅ Resposta recebida com sucesso!');
            
            if (result.success) {
                // Verificar formato do código PIX
                const pixCode = result.paymentData.pixCode;
                console.log('📝 Código PIX recebido:');
                console.log(pixCode);
                
                // Verificar se é um JSON string
                let isJsonString = false;
                try {
                    const jsonTest = JSON.parse(pixCode);
                    if (jsonTest && jsonTest.code) {
                        isJsonString = true;
                        console.log('⚠️ ERRO: O código PIX ainda está em formato JSON!');
                        console.log('   Deveria ser texto puro, mas recebemos um objeto JSON');
                    }
                } catch (e) {
                    // Não é JSON - isso é bom!
                    console.log('✅ SUCESSO: Código PIX está no formato correto (texto puro)!');
                }
                
                // Verificar se o código começa com o padrão EMV
                if (pixCode.startsWith('00020126')) {
                    console.log('✅ FORMATO EMV: O código PIX inicia com o padrão EMV correto (00020126)');
                } else {
                    console.log('⚠️ FORMATO INCORRETO: O código PIX não inicia com o padrão EMV (00020126)');
                }
                
                // Salvar código PIX para análise
                fs.writeFileSync('codigo-pix-teste.txt', pixCode);
                console.log('💾 Código PIX salvo em: codigo-pix-teste.txt');
                
                // Resultado geral
                if (!isJsonString && pixCode.startsWith('00020126')) {
                    console.log('\n🎉 CORREÇÃO BEM-SUCEDIDA! O código PIX está sendo retornado no formato correto.');
                } else {
                    console.log('\n❌ CORREÇÃO INCOMPLETA! O código PIX ainda precisa de ajustes.');
                }
            } else {
                console.log('❌ Erro na criação do pagamento PIX:', result.error || 'Erro desconhecido');
            }
        } catch (e) {
            console.log('❌ Erro ao processar resposta:', e.message);
            console.log('Resposta bruta:', responseData);
        }
    });
});

req.on('error', (e) => {
    console.log('❌ Erro na requisição:', e.message);
});

req.write(data);
req.end();

console.log('📤 Requisição enviada, aguardando resposta...');
