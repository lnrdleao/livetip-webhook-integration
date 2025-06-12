// teste-simple-qr.js - Script de teste simples para verificar a geração de QR code

const axios = require('axios');

async function testQR() {
    try {
        console.log('🧪 Testando geração de QR code PIX...');
        const response = await axios.post('http://localhost:3001/generate-qr', {
            userName: 'Teste PIX Simples',
            paymentMethod: 'pix',
            amount: 1
        });
        
        console.log('Status da resposta:', response.status);
        console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
        
        // Verificar se o QR code foi gerado
        if (response.data.success && response.data.data && response.data.data.qrCodeImage) {
            console.log('✅ QR code gerado com sucesso:', 
                response.data.data.qrCodeImage.substring(0, 50) + '...');
        } else {
            console.log('❌ Falha na geração do QR code');
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        if (error.response) {
            console.error('Status do erro:', error.response.status);
            console.error('Dados do erro:', error.response.data);
        }
    }
}

testQR();
