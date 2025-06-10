// Teste simples direto
const axios = require('axios');

async function simpleTest() {
    console.log('🧪 Teste simples do endpoint...');
    
    try {
        // Teste básico de saúde
        const healthResponse = await axios.get('http://localhost:3001/health');
        console.log('✅ Health check:', healthResponse.status);
        
        // Teste PIX
        const pixResponse = await axios.post('http://localhost:3001/generate-qr', {
            userName: "Teste",
            paymentMethod: "pix", 
            amount: 2,
            uniqueId: "PIX_TEST_123"
        });
        
        console.log('✅ PIX Response:', pixResponse.status);
        console.log('📦 PIX Data:', JSON.stringify(pixResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
    }
}

simpleTest();
