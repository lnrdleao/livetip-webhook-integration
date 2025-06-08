// Teste rápido da API LiveTip corrigida
const LiveTipService = require('./liveTipService');

async function testQuick() {
    console.log('🧪 Teste rápido da API LiveTip corrigida...');
    
    const liveTip = new LiveTipService();
    
    try {
        const result = await liveTip.createBitcoinPayment({
            userName: "Leonardo",
            amount: 200, // satoshis
            externalId: "test123",
            uniqueId: "BTC_TEST_123"
        });
        
        console.log('✅ Resultado:', result);
        
        if (result.lightningInvoice) {
            console.log('⚡ Lightning Invoice gerado!');
            console.log('Primeiros 50 chars:', result.lightningInvoice.substring(0, 50) + '...');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testQuick();
