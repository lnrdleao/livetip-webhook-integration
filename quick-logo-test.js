console.log('🎨 Starting QR Logo Test...');

const axios = require('axios');

async function quickTest() {
    try {
        console.log('📡 Testing server connection...');
        
        const response = await axios.post('http://localhost:3001/create-payment', {
            userName: 'Logo Test',
            paymentMethod: 'bitcoin',
            amount: 100
        });
        
        console.log('✅ Response received!');
        console.log('Success:', response.data.success);
        
        if (response.data.qrCode) {
            console.log('🎯 QR Code generated!');
            console.log('Length:', response.data.qrCode.length);
            console.log('Format check:', response.data.qrCode.startsWith('data:image/png;base64,') ? '✅ PNG' : '❌ Invalid');
            
            // Test PIX too
            const pixResponse = await axios.post('http://localhost:3001/create-payment', {
                userName: 'PIX Logo Test',
                paymentMethod: 'pix',
                amount: 50
            });
            
            if (pixResponse.data.qrCode) {
                console.log('🎯 PIX QR Code also generated!');
                console.log('PIX Length:', pixResponse.data.qrCode.length);
                console.log('PIX Format:', pixResponse.data.qrCode.startsWith('data:image/png;base64,') ? '✅ PNG' : '❌ Invalid');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

quickTest();
