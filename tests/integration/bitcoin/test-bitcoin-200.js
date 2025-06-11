const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function testBitcoin200() {
    try {
        console.log('🚀 Testando pagamento Bitcoin - 200 sats');
        
        // Gerar ID único para este teste
        const uniqueId = `BTC_200_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`🔑 ID Único: ${uniqueId}`);
          const payload = {
            userName: "Teste 200 Sats",
            paymentMethod: "bitcoin",
            amount: 200,
            uniqueId: uniqueId // ID Único será enviado como mensagem para LiveTip
        };

        console.log('📋 Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post('http://localhost:3001/create-payment', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Resposta do servidor:', JSON.stringify(response.data, null, 2));
        
        if (response.data.lightning_invoice) {
            console.log('⚡ Lightning Invoice criado com sucesso!');
            console.log(`💰 Valor: 200 satoshis`);
            console.log(`🔑 ID Único: ${uniqueId}`);
            console.log(`📱 Invoice: ${response.data.lightning_invoice.substring(0, 50)}...`);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

// Executar o teste
testBitcoin200();
