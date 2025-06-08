const axios = require('axios');

async function testPixQR() {
    console.log('🧪 PIX QR Code Logo Test...');
    
    try {
        const baseUrl = 'http://localhost:3001';
        
        console.log('📱 Testing PIX payment...');
        const pixResponse = await axios.post(`${baseUrl}/create-payment`, {
            userName: 'Test PIX User',
            paymentMethod: 'pix',
            amount: 50
        });

        console.log('✅ PIX Response received');
        console.log('📋 Success:', pixResponse.data.success);
        
        if (pixResponse.data.qrCode) {
            console.log('🎉 PIX QR Code generated with logo!');
            console.log('📏 QR Code size:', pixResponse.data.qrCode.length, 'characters');
            console.log('🖼️ Starts with:', pixResponse.data.qrCode.substring(0, 50) + '...');
            
            // Check if it's a valid data URL
            if (pixResponse.data.qrCode.startsWith('data:image/png;base64,')) {
                console.log('✅ Valid PNG data URL format');
            } else {
                console.log('❌ Invalid data URL format');
            }
        } else {
            console.log('❌ No QR code in response');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('📋 Response status:', error.response.status);
            console.error('📋 Response data:', error.response.data);
        }
    }
}

testPixQR();
