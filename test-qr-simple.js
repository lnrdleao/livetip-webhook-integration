const axios = require('axios');

async function testSimple() {
    console.log('🧪 Simple QR Code Logo Test...');
    
    try {
        console.log('📱 Testing Bitcoin payment...');
        const response = await axios.post('http://localhost:3001/create-payment', {
            userName: 'Test User',
            paymentMethod: 'bitcoin',
            amount: 100
        }, {
            timeout: 10000
        });
        
        console.log('✅ Bitcoin Response received');
        console.log('📋 Success:', response.data.success);
        
        if (response.data.success && response.data.qrCodeImage) {
            console.log('🎉 QR Code generated with logo!');
            console.log('📏 QR Code size:', response.data.qrCodeImage.length, 'characters');
            console.log('🖼️ Starts with:', response.data.qrCodeImage.substring(0, 50));
        } else if (response.data.success && response.data.data && response.data.data.qrCodeImage) {
            console.log('🎉 QR Code generated with logo (nested)!');
            console.log('📏 QR Code size:', response.data.data.qrCodeImage.length, 'characters');
            console.log('🖼️ Starts with:', response.data.data.qrCodeImage.substring(0, 50));
        } else {
            console.log('❌ No QR code found in response');
            console.log('📋 Response structure:', Object.keys(response.data));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('📋 Status:', error.response.status);
            console.error('📋 Data:', error.response.data);
        }
    }
}

testSimple();
