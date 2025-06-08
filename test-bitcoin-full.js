// Teste completo do pagamento Bitcoin via servidor
const fetch = require('node-fetch');

async function testBitcoinPayment() {
    console.log('🧪 Testando pagamento Bitcoin completo...');
    
    try {
        const paymentData = {
            userName: "Test User",
            amount: 150.00,
            paymentMethod: "bitcoin"
        };
        
        console.log('📤 Criando pagamento:', JSON.stringify(paymentData, null, 2));
        
        const response = await fetch('http://localhost:3001/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        
        console.log('📊 Status:', response.status);
        
        const result = await response.json();
        console.log('📝 Resposta completa:', JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('✅ Pagamento Bitcoin criado com sucesso!');
            console.log('⚡ Lightning Invoice:', result.paymentData.lightningInvoice);
            console.log('🆔 Payment ID:', result.paymentId);
            console.log('🏦 Fonte:', result.paymentData.source);
        } else {
            console.log('❌ Erro:', result.error);
        }
        
    } catch (error) {
        console.error('💥 Erro no teste:', error.message);
    }
    
    console.log('🏁 Teste finalizado');
    process.exit(0);
}

testBitcoinPayment();
