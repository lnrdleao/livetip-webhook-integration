const axios = require('axios');

async function testBitcoin1000Sats() {
    try {
        console.log('🚀 Testando pagamento Bitcoin - 1000 sats');
        
        // Gerar ID único para este teste
        const uniqueId = `BTC_1000_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`🔑 ID Único: ${uniqueId}`);

        const payload = {
            userName: "Teste 1000 Sats",
            paymentMethod: "bitcoin",
            amount: 1000,
            uniqueId: uniqueId // ID Único será enviado como mensagem para LiveTip
        };

        console.log('📋 Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post('http://localhost:3001/create-payment', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Resposta do servidor:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

// Executar o teste
testBitcoin1000Sats();
