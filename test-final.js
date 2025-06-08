// Teste final do pagamento Bitcoin corrigido
const fetch = require('node-fetch');

async function testBitcoinFixed() {
    console.log('🔧 === TESTE BITCOIN CORRIGIDO ===\n');
    
    try {
        const testData = {
            userName: "Leonardo",
            paymentMethod: "bitcoin", 
            amount: 200,
            uniqueId: `BTC_FINAL_${Date.now()}`
        };
        
        console.log('📤 Testando /generate-qr com dados:', testData);
        
        const response = await fetch('http://localhost:3001/generate-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        console.log('\n📊 RESULTADO:');
        console.log('Success:', result.success);
        
        if (result.success) {
            const data = result.data;
            console.log('✅ Pagamento criado com sucesso!');
            console.log('- Source:', data.source);
            console.log('- Method:', data.method);
            console.log('- Amount:', data.amount, 'satoshis');
            console.log('- Unique ID:', data.uniqueId);
            console.log('- Tem Lightning Invoice:', !!data.lightningInvoice);
            console.log('- Tem Bitcoin URI:', !!data.bitcoinUri);
            console.log('- Tem QR Code:', !!data.qrCodeImage);
            
            if (data.source === 'livetip') {
                console.log('\n🎉 SUCESSO! Lightning Invoice da LiveTip API');
                console.log('Invoice:', data.lightningInvoice?.substring(0, 50) + '...');
            } else {
                console.log('\n⚠️ Fallback local ativo');
                console.log('Bitcoin URI:', data.bitcoinUri);
            }
        } else {
            console.log('❌ Erro:', result.error);
        }
        
    } catch (error) {
        console.error('💥 Erro:', error.message);
    }
}

testBitcoinFixed();
