// Teste completo do endpoint /generate-qr local
const axios = require('axios');

async function testLocalEndpoint() {
    console.log('🔧 Testando endpoint /generate-qr local...\n');

    const baseUrl = 'http://localhost:3001'; // ou a porta que estiver rodando

    // Teste 1: PIX
    console.log('1️⃣ TESTANDO PIX LOCAL:');
    try {
        const pixResponse = await axios.post(`${baseUrl}/generate-qr`, {
            userName: "João Teste",
            paymentMethod: "pix",
            amount: 2,
            uniqueId: "PIX_" + Date.now() + "_test"
        });

        console.log('✅ PIX Response Status:', pixResponse.status);
        console.log('📦 PIX Response:', JSON.stringify(pixResponse.data, null, 2));
        
        if (pixResponse.data.success && pixResponse.data.data.pixCode) {
            const pixCode = pixResponse.data.data.pixCode;
            console.log('📄 PIX Code length:', pixCode.length);
            console.log('📄 PIX Code:', pixCode);
            console.log('📄 Starts with correct format?', pixCode.includes('00020126') || pixCode.includes('PIX'));
        }
    } catch (error) {
        console.error('❌ PIX Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 2: Bitcoin
    console.log('2️⃣ TESTANDO BITCOIN LOCAL:');
    try {
        const btcResponse = await axios.post(`${baseUrl}/generate-qr`, {
            userName: "João Teste",
            paymentMethod: "bitcoin",
            amount: 100,
            uniqueId: "BTC_" + Date.now() + "_test"
        });

        console.log('✅ BTC Response Status:', btcResponse.status);
        console.log('📦 BTC Response:', JSON.stringify(btcResponse.data, null, 2));
        
        if (btcResponse.data.success && btcResponse.data.data.lightningInvoice) {
            const invoice = btcResponse.data.data.lightningInvoice;
            console.log('⚡ Lightning Invoice length:', invoice.length);
            console.log('⚡ Lightning Invoice:', invoice);
            console.log('⚡ Starts with lnbc?', invoice.startsWith('lnbc'));
            console.log('⚡ Invoice format valid?', invoice.length > 100 && invoice.startsWith('lnbc'));
        }
    } catch (error) {
        console.error('❌ BTC Error:', error.response?.data || error.message);
    }
}

// Teste de QR Code válido
function testQRCodeValidation() {
    console.log('\n3️⃣ TESTANDO VALIDAÇÃO DE QR CODES:');
    
    // Exemplos de códigos válidos
    const validPIX = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000052040000530398654041.005802BR5925JOAO DA SILVA SAURO6009SAO PAULO62070503***63041234";
    const validLightning = "lnbc10u1p3pj257pp5yztkwjm8myrxqh0xj3g2v7x8qyqzzxkz4fv5vz8qzvxavsgh2ljsdqqcqzpgxqyz5vqsp5usyc4lk5hea5lyqqhf9hxfqvwq0dz9kcz6fzr8w0cj7k9r8l8sks5q9qrsgqadx9tl76gdcjy0gfyylczc6wt6wlqzx4tgm49vv0kvkqfq6tfm9c3f2wvz7qyxcsqzkf6dh8s4s7p2z";
    
    console.log('📄 PIX válido length:', validPIX.length);
    console.log('📄 PIX válido format:', validPIX.includes('00020126') ? '✅' : '❌');
    
    console.log('⚡ Lightning válido length:', validLightning.length);
    console.log('⚡ Lightning válido format:', validLightning.startsWith('lnbc') ? '✅' : '❌');
}

// Executar testes
testLocalEndpoint().then(() => {
    testQRCodeValidation();
    console.log('\n🎯 Teste concluído!');
}).catch(error => {
    console.error('❌ Erro geral:', error);
    testQRCodeValidation();
});
