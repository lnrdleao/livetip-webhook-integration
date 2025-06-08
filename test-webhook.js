const fetch = require('node-fetch');

// Dados de teste para simular um webhook do LiveTip
const webhookData = {
    event: "payment_confirmed",
    payment: {
        sender: "leonardo_test",
        receiver: "livetip_merchant",
        content: "Pagamento LiveTip - Leonardo Test",
        amount: 25.50,
        currency: "BRL",
        timestamp: new Date().toISOString(),
        paid: true,
        paymentId: "lt_pay_test_" + Date.now(),
        read: true
    }
};

// Função para testar o webhook
async function testWebhook() {
    try {        console.log('🧪 Testando webhook do LiveTip...');
        console.log('📡 Enviando dados:', JSON.stringify(webhookData, null, 2));

        const response = await fetch('http://localhost:3001/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livetip-Webhook-Secret-Token': '2400613d5c2fb33d76e76c298d1dab4c'
            },
            body: JSON.stringify(webhookData)
        });

        const result = await response.json();
        
        console.log('✅ Status:', response.status);
        console.log('📋 Resposta:', JSON.stringify(result, null, 2));
        
        if (response.status === 200) {
            console.log('🎉 Webhook processado com sucesso!');
        } else {
            console.log('❌ Erro no webhook');
        }

    } catch (error) {
        console.error('❌ Erro ao testar webhook:', error.message);
    }
}

// Testar webhook com token inválido
async function testInvalidToken() {
    try {        console.log('\n🔒 Testando com token inválido...');

        const response = await fetch('http://localhost:3001/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livetip-Webhook-Secret-Token': 'token_invalido'
            },
            body: JSON.stringify(webhookData)
        });

        console.log('🚫 Status esperado 403:', response.status);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Testar webhook sem token
async function testNoToken() {
    try {        console.log('\n🚨 Testando sem token...');

        const response = await fetch('http://localhost:3001/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });

        console.log('🚫 Status esperado 401:', response.status);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Executar todos os testes
async function runAllTests() {
    console.log('🎯 Iniciando testes do webhook LiveTip\n');
    
    await testWebhook();
    await testInvalidToken();
    await testNoToken();
    
    console.log('\n✅ Testes concluídos!');
}

// Executar se chamado diretamente
if (require.main === module) {
    runAllTests();
}

module.exports = { testWebhook, testInvalidToken, testNoToken };
