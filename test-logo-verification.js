const axios = require('axios');
const fs = require('fs');

async function testQRLogos() {
    console.log('🎨 QR Code Logo Verification Test');
    console.log('================================');
    
    const baseUrl = 'http://localhost:3001';
    const tests = [
        {
            name: 'Bitcoin',
            method: 'bitcoin',
            amount: 100,
            userName: 'Bitcoin Test User'
        },
        {
            name: 'PIX',
            method: 'pix', 
            amount: 50,
            userName: 'PIX Test User'
        }
    ];

    for (const test of tests) {
        console.log(`\n🧪 Testing ${test.name} QR Code...`);
        
        try {
            const response = await axios.post(`${baseUrl}/create-payment`, {
                userName: test.userName,
                paymentMethod: test.method,
                amount: test.amount
            });

            if (response.data.success && response.data.qrCode) {
                console.log(`✅ ${test.name} QR Code generated successfully`);
                console.log(`📏 Size: ${response.data.qrCode.length} characters`);
                
                // Verify it's a PNG data URL
                if (response.data.qrCode.startsWith('data:image/png;base64,')) {
                    console.log(`✅ Valid PNG format`);
                    
                    // Save QR code for visual inspection
                    const base64Data = response.data.qrCode.replace('data:image/png;base64,', '');
                    const fileName = `qr_${test.method}_test.png`;
                    
                    try {
                        fs.writeFileSync(fileName, base64Data, 'base64');
                        console.log(`💾 Saved as ${fileName} for visual inspection`);
                    } catch (saveError) {
                        console.log(`⚠️ Could not save file: ${saveError.message}`);
                    }
                    
                } else {
                    console.log(`❌ Invalid format: ${response.data.qrCode.substring(0, 50)}...`);
                }
                
                // Additional response data
                if (response.data.paymentId) {
                    console.log(`🆔 Payment ID: ${response.data.paymentId}`);
                }
                if (response.data.address) {
                    console.log(`📍 Address: ${response.data.address.substring(0, 20)}...`);
                }
                
            } else {
                console.log(`❌ ${test.name} QR Code generation failed`);
                console.log('Response:', response.data);
            }
            
        } catch (error) {
            console.error(`❌ ${test.name} test failed:`, error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
        }
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('- Check the generated PNG files to visually verify logos');
    console.log('- Bitcoin logo should be orange with ₿ symbol');
    console.log('- PIX logo should be blue with "PIX" text');
    console.log('- Both QR codes should remain scannable');
}

testQRLogos();
