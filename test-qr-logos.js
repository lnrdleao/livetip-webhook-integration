const axios = require('axios');
const fs = require('fs').promises;

async function testQRCodeLogos() {
    console.log('🎯 Testing QR Code Logo Generation...\n');
    
    const baseUrl = 'http://localhost:3001';
    
    try {        // Test Bitcoin QR Code with Logo
        console.log('📱 Testing Bitcoin QR Code with Logo...');
        const bitcoinResponse = await axios.post(`${baseUrl}/create-payment`, {
            userName: 'Test User Bitcoin',
            paymentMethod: 'bitcoin',
            amount: 100
        });
          if (bitcoinResponse.data.success && bitcoinResponse.data.data && bitcoinResponse.data.data.qrCodeImage) {
            console.log('✅ Bitcoin QR Code generated successfully');
            console.log('📊 QR Code size:', bitcoinResponse.data.data.qrCodeImage.length, 'characters');
            
            // Save Bitcoin QR code to file for visual inspection
            const bitcoinBase64 = bitcoinResponse.data.data.qrCodeImage.split(',')[1];
            await fs.writeFile('bitcoin-qr-with-logo.png', bitcoinBase64, 'base64');
            console.log('💾 Bitcoin QR code saved as bitcoin-qr-with-logo.png');
        } else {
            console.log('❌ Bitcoin QR Code generation failed');
            console.log('Response:', bitcoinResponse.data);
        }
        
        console.log('');
          // Test PIX QR Code with Logo
        console.log('📱 Testing PIX QR Code with Logo...');
        const pixResponse = await axios.post(`${baseUrl}/create-payment`, {
            userName: 'Test User PIX',
            paymentMethod: 'pix',
            amount: 10.50
        });
          if (pixResponse.data.success && pixResponse.data.qrCodeImage) {
            console.log('✅ PIX QR Code generated successfully');
            console.log('📊 QR Code size:', pixResponse.data.qrCodeImage.length, 'characters');
            
            // Save PIX QR code to file for visual inspection
            const pixBase64 = pixResponse.data.qrCodeImage.split(',')[1];
            await fs.writeFile('pix-qr-with-logo.png', pixBase64, 'base64');
            console.log('💾 PIX QR code saved as pix-qr-with-logo.png');
        } else {
            console.log('❌ PIX QR Code generation failed');
            console.log('Response:', pixResponse.data);
        }
        
        console.log('');
          // Test /generate-qr endpoint
        console.log('📱 Testing /generate-qr endpoint...');
        const qrResponse = await axios.post(`${baseUrl}/generate-qr`, {
            userName: 'Test Generate QR',
            paymentMethod: 'bitcoin',
            amount: 200,
            uniqueId: 'TEST_' + Date.now()
        });
          if (qrResponse.data.success && qrResponse.data.data && qrResponse.data.data.qrCodeImage) {
            console.log('✅ Generate QR endpoint working with logo');
            console.log('📊 QR Code size:', qrResponse.data.data.qrCodeImage.length, 'characters');
            
            // Save test QR code to file for visual inspection
            const testBase64 = qrResponse.data.data.qrCodeImage.split(',')[1];
            await fs.writeFile('test-generate-qr-with-logo.png', testBase64, 'base64');
            console.log('💾 Test QR code saved as test-generate-qr-with-logo.png');
        } else {
            console.log('❌ Generate QR endpoint failed');
            console.log('Response:', qrResponse.data);
        }
        
        console.log('\n🎉 QR Code Logo Test Complete!');
        console.log('📁 Check the generated PNG files to verify logos are embedded correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testQRCodeLogos();
