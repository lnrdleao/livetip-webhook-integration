// Script Node.js para testar webhook LiveTip atualizado
// Arquivo: test-webhook-simple.js

const fetch = require('node-fetch');

// Configurações
const WEBHOOK_URL = 'http://localhost:3001/webhook';
const SECRET_TOKEN = '37de1854e9469607092124ed015c1f91';

// Função para testar webhook
async function testWebhook(testName, payload, expectedStatus = 200, token = SECRET_TOKEN) {
    console.log(`\n🧪 Teste: ${testName}`);
    console.log('-'.repeat(50));
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['X-Livetip-Webhook-Secret-Token'] = token;
        }
        
        console.log('📡 Enviando:', JSON.stringify(payload, null, 2));
        
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

// Executar todos os testes
async function runAllTests() {
    console.log('🚀 Iniciando testes do webhook LiveTip atualizado');
    console.log('='.repeat(60));
    
    const tests = [];
    
    // Teste 1: Pagamento confirmado válido
    tests.push(await testWebhook(
        'Pagamento Confirmado Válido',
        {
            event: 'payment_confirmed',
            payment: {
                sender: 'TestUser',
                receiver: 'merchant',
                content: 'Test payment',
                amount: 25.50,
                currency: 'BRL',
                timestamp: new Date().toISOString(),
                paid: true,
                paymentId: `test_${Date.now()}`,
                read: true
            }
        },
        200
    ));
    
    // Teste 2: Pagamento pendente
    tests.push(await testWebhook(
        'Pagamento Pendente',
        {
            event: 'payment_pending',
            payment: {
                sender: 'TestUser2',
                amount: 15.75,
                paymentId: `pending_${Date.now()}`,
                paid: false
            }
        },
        200
    ));
    
    // Teste 3: Pagamento falhado
    tests.push(await testWebhook(
        'Pagamento Falhado',
        {
            event: 'payment_failed',
            payment: {
                sender: 'TestUser3',
                amount: 50.00,
                paymentId: `failed_${Date.now()}`,
                paid: false
            }
        },
        200
    ));
    
    // Teste 4: Token inválido (deve falhar)
    tests.push(await testWebhook(
        'Token Inválido',
        {
            event: 'payment_confirmed',
            payment: {
                sender: 'TestUser',
                amount: 10.00,
                paymentId: 'test_invalid',
                paid: true
            }
        },
        403,
        'token_invalido'
    ));
    
    // Teste 5: Sem token (deve falhar)
    tests.push(await testWebhook(
        'Sem Token',
        {
            event: 'payment_confirmed',
            payment: {
                sender: 'TestUser',
                amount: 10.00,
                paymentId: 'test_no_token',
                paid: true
            }
        },
        401,
        null
    ));
    
    // Teste 6: Payload inválido (deve falhar)
    tests.push(await testWebhook(
        'Payload Inválido',
        {
            // Faltando event
            payment: {
                sender: 'TestUser',
                amount: 10.00
            }
        },
        400
    ));
    
    // Resumo dos testes
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('='.repeat(60));
    
    const passed = tests.filter(Boolean).length;
    const total = tests.length;
    
    console.log(`✅ Testes que passaram: ${passed}/${total}`);
    console.log(`❌ Testes que falharam: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM! Webhook funcionando perfeitamente.');
    } else {
        console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
    }
    
    // Testar endpoints de monitoramento
    console.log('\n🔍 Testando endpoints de monitoramento...');
    
    try {
        // Testar logs
        const logsResponse = await fetch('http://localhost:3001/webhook-logs?limit=3');
        const logs = await logsResponse.json();
        console.log(`📋 Logs: ${logs.total} total, ${logs.logs.length} retornados`);
        
        // Testar estatísticas
        const statsResponse = await fetch('http://localhost:3001/webhook-stats');
        const stats = await statsResponse.json();
        console.log(`📊 Stats: ${stats.totalWebhooks} webhooks, ${stats.totalPayments} pagamentos`);
        
        console.log('✅ Endpoints de monitoramento funcionando!');
        
    } catch (error) {
        console.log('❌ Erro ao testar endpoints:', error.message);
    }
    
    console.log('\n🎯 Teste completo finalizado!');
    console.log('🔗 Acesse http://localhost:3001/webhook-logs para ver logs detalhados');
    console.log('📊 Acesse http://localhost:3001/webhook-stats para estatísticas');
}

// Executar se chamado diretamente
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { testWebhook, runAllTests };
