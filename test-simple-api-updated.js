// Teste da API simplificada (index-simple.js) - Versão atualizada
const fetch = require('node-fetch');

// URL da API - ajuste conforme necessário
const API_URL = 'http://localhost:3001/api/simple'; // ou use a URL da Vercel se estiver testando em produção

// Token para teste de webhook
const WEBHOOK_TOKEN = '0ac7b9aa00e75e0215243f3bb177c844';

// Testar endpoint de saúde
async function testHealth() {
    console.log('🧪 Testando endpoint de saúde...');
    
    try {
        const response = await fetch(`${API_URL}/health`);
        const result = await response.json();
        
        console.log('✅ Resposta recebida:');
        console.log(result);
        
        return result;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return null;
    }
}

// Testar criação de pagamento
async function testCreatePayment() {
    console.log('\n🧪 Testando criação de pagamento...');
    
    try {
        const response = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: "Cliente Teste",
                valor: 25.50
            })
        });
        
        const result = await response.json();
        
        console.log('✅ Resposta recebida:');
        console.log(result);
        
        return result;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return null;
    }
}

// Testar consulta de status
async function testGetStatus(id) {
    if (!id) {
        console.log('\n⚠️ Sem ID de pagamento para consultar status');
        return null;
    }
    
    console.log(`\n🧪 Testando consulta de status para ${id}...`);
    
    try {
        const response = await fetch(`${API_URL}/status/${id}`);
        const result = await response.json();
        
        console.log('✅ Resposta recebida:');
        console.log(result);
        
        return result;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return null;
    }
}

// Testar webhook
async function testWebhook(id) {
    if (!id) {
        console.log('\n⚠️ Sem ID de pagamento para webhook');
        return null;
    }
    
    console.log(`\n🧪 Testando webhook para ${id}...`);
    
    try {
        const response = await fetch(`${API_URL}/webhook`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Livetip-Webhook-Secret-Token': WEBHOOK_TOKEN
            },
            body: JSON.stringify({ id })
        });
        
        const result = await response.json();
        
        console.log('✅ Resposta do webhook:');
        console.log(result);
        
        return result;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return null;
    }
}

// Testar listagem de pagamentos
async function testListPayments() {
    console.log('\n🧪 Testando listagem de pagamentos...');
    
    try {
        const response = await fetch(`${API_URL}/payments`);
        const result = await response.json();
        
        console.log('✅ Resposta recebida:');
        console.log(`Total de pagamentos: ${result.count}`);
        
        if (result.payments && result.payments.length > 0) {
            console.log('Últimos 3 pagamentos:');
            result.payments.slice(-3).forEach(payment => {
                console.log(`- ID: ${payment.id}, Nome: ${payment.nome}, Valor: ${payment.valor}, Status: ${payment.status}`);
            });
        }
        
        return result;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return null;
    }
}

// Executar testes em sequência
async function runTests() {
    console.log('🚀 Iniciando testes da API simplificada...');
    console.log(`🔗 URL da API: ${API_URL}`);
    console.log('🔑 Token webhook:', WEBHOOK_TOKEN);
    console.log('---------------------------------------------');
    
    // Verificar saúde da API
    await testHealth();
    
    // Criar um novo pagamento
    const paymentResult = await testCreatePayment();
    let paymentId = null;
    
    if (paymentResult && paymentResult.success) {
        paymentId = paymentResult.id;
        
        // Consultar status inicial
        await testGetStatus(paymentId);
        
        // Simular confirmação via webhook
        await testWebhook(paymentId);
        
        // Verificar novo status
        await testGetStatus(paymentId);
    }
    
    // Listar todos os pagamentos
    await testListPayments();
    
    console.log('\n---------------------------------------------');
    console.log('🏁 Testes concluídos!');
}

// Executar testes
runTests().catch(console.error);
