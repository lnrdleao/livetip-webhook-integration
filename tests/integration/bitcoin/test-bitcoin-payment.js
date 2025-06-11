// Teste completo do pagamento Bitcoin
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testBitcoinPayment() {
    console.log('🧪 === TESTE DE PAGAMENTO BITCOIN ===\n');
    
    try {
        console.log('📱 Testando geração de QR Code Bitcoin via /generate-qr...');
        
        const testData = {
            userName: "Leonardo Teste",
            paymentMethod: "bitcoin",
            amount: 200, // 200 satoshis
            uniqueId: `BTC_TEST_${Date.now()}`
        };
        
        console.log('📤 Enviando dados:', JSON.stringify(testData, null, 2));
        
        const response = await axios.post(`${BASE_URL}/generate-qr`, testData);
        
        console.log('\n✅ Resposta recebida:');
        console.log('Status:', response.status);
        console.log('Success:', response.data.success);
        
        if (response.data.success) {
            const data = response.data.data;
            console.log('\n📊 Dados do pagamento:');
            console.log('- Payment ID:', data.paymentId);
            console.log('- Método:', data.method);
            console.log('- Satoshis:', data.amount);
            console.log('- ID Único:', data.uniqueId);
            console.log('- Source:', data.source);
            console.log('- Tem QR Code Image:', !!data.qrCodeImage);
            console.log('- Tem Lightning Invoice:', !!data.lightningInvoice);
            console.log('- Tem Bitcoin URI:', !!data.bitcoinUri);
            
            if (data.lightningInvoice) {
                console.log('\n⚡ Lightning Invoice (primeiros 50 chars):');
                console.log(data.lightningInvoice.substring(0, 50) + '...');
            }
            
            if (data.bitcoinUri) {
                console.log('\n₿ Bitcoin URI:');
                console.log(data.bitcoinUri);
            }
            
            console.log('\n🖼️ QR Code Image (primeiros 100 chars):');
            console.log(data.qrCodeImage ? data.qrCodeImage.substring(0, 100) + '...' : 'Não disponível');
            
            // Verificar se é LiveTip ou fallback
            if (data.source === 'livetip') {
                console.log('\n✅ SUCESSO: Lightning Invoice gerado pela LiveTip API');
                console.log('   O sistema está funcionando conforme esperado!');
            } else {
                console.log('\n⚠️ FALLBACK: Bitcoin URI gerado localmente');
                console.log('   A API da LiveTip pode estar indisponível');
            }
            
        } else {
            console.log('\n❌ Erro na resposta:', response.data.error);
        }
        
    } catch (error) {
        console.error('\n❌ Erro no teste:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
    }
}

// Executar teste
testBitcoinPayment().then(() => {
    console.log('\n🏁 Teste concluído');
    process.exit(0);
}).catch(console.error);
