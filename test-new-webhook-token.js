// Teste do novo token do webhook LiveTip
// Arquivo: test-new-webhook-token.js

const fetch = require('node-fetch');

// Configurações atualizadas
const WEBHOOK_URL = 'http://localhost:3001/webhook';
const NEW_TOKEN = '37de1854e9469607092124ed015c1f91';
const OLD_TOKEN = '2400613d5c2fb33d76e76c298d1dab4c';

// Função para testar webhook
async function testWebhook(testName, payload, token, expectedStatus = 200) {
    console.log(`\n🧪 Teste: ${testName}`);
    console.log('='.repeat(60));
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['X-Livetip-Webhook-Secret-Token'] = token;
        }
        
        console.log('📡 Enviando:', JSON.stringify(payload, null, 2));
        console.log(`🔑 Token: ${token ? token.substring(0, 8) + '...' : 'Nenhum'}`);
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        console.log(`📊 Status: ${response.status} (esperado: ${expectedStatus})`);
        console.log('📋 Resposta:', JSON.stringify(result, null, 2));
        
        if (response.status === expectedStatus) {
            console.log('✅ Teste PASSOU');
            return true;
        } else {
            console.log('❌ Teste FALHOU');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Erro:', error.message);
        return false;
    }
}

// Payload de teste
const testPayload = {
    event: 'payment_confirmed',
    payment: {
        sender: 'TestUser_NewToken',
        receiver: 'livetip_merchant',
        content: 'Teste com novo token do webhook',
        amount: 25.50,
        currency: 'BRL',
        timestamp: new Date().toISOString(),
        paid: true,
        paymentId: `test_new_token_${Date.now()}`,
        read: true
    }
};

// Executar todos os testes
async function runTokenTests() {
    console.log('🎯 Testando Nova Configuração do Token LiveTip');
    console.log('=' .repeat(60));
    console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
    console.log('');
    
    const tests = [];
    
    // Teste 1: Novo token (deve passar)
    tests.push(await testWebhook(
        'Novo Token Válido (deve PASSAR)',
        testPayload,
        NEW_TOKEN,
        200
    ));
    
    // Teste 2: Token antigo (deve falhar)
    tests.push(await testWebhook(
        'Token Antigo (deve FALHAR)',
        testPayload,
        OLD_TOKEN,
        403
    ));
    
    // Teste 3: Token inválido (deve falhar)
    tests.push(await testWebhook(
        'Token Inválido (deve FALHAR)',
        testPayload,
        'token_completamente_invalido',
        403
    ));
    
    // Teste 4: Sem token (deve falhar)
    tests.push(await testWebhook(
        'Sem Token (deve FALHAR)',
        testPayload,
        null,
        401
    ));
    
    // Teste 5: Payload inválido com novo token
    tests.push(await testWebhook(
        'Payload Inválido com Novo Token (deve FALHAR)',
        { event: 'invalid_event' }, // Payload incompleto
        NEW_TOKEN,
        400
    ));
    
    // Resumo dos testes
    console.log('\n📊 RESUMO DOS TESTES DO NOVO TOKEN');
    console.log('='.repeat(60));
    
    const passed = tests.filter(Boolean).length;
    const total = tests.length;
    
    console.log(`✅ Testes que passaram: ${passed}/${total}`);
    console.log(`❌ Testes que falharam: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM!');
        console.log('✅ Novo token configurado com sucesso!');
        console.log('✅ Sistema pronto para receber webhooks do LiveTip!');
    } else {
        console.log('\n⚠️ Alguns testes falharam. Verifique a configuração.');
    }
    
    // Informações de configuração
    console.log('\n🔧 CONFIGURAÇÃO PARA O LIVETIP');
    console.log('='.repeat(60));
    console.log('🌐 URL de destino: https://seusite.com/webhook');
    console.log('🔑 Token secreto: 37de1854e9469607092124ed015c1f91');
    console.log('✅ Ativar webhook: Sim');
    console.log('');
    console.log('📚 Para mais detalhes, consulte: WEBHOOK_LIVETIP_CONFIG.md');
}

// Executar se chamado diretamente
if (require.main === module) {
    runTokenTests().catch(console.error);
}

module.exports = { testWebhook, runTokenTests, NEW_TOKEN };
