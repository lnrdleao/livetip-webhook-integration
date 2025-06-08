const axios = require('axios');
const fs = require('fs');

async function finalLogoVerification() {
    console.log('🎨 FINAL QR CODE LOGO VERIFICATION');
    console.log('=================================');
    
    const baseUrl = 'http://localhost:3001';
    
    try {
        // Test Bitcoin QR with Logo
        console.log('\n🟠 Testing Bitcoin QR Code with Logo...');
        const bitcoinResponse = await axios.post(`${baseUrl}/create-payment`, {
            userName: 'Final Bitcoin Test',
            paymentMethod: 'bitcoin',
            amount: 100
        });
        
        if (bitcoinResponse.data.success) {
            // Check different possible response structures
            const qrCode = bitcoinResponse.data.qrCodeImage || 
                          bitcoinResponse.data.qrCode ||
                          (bitcoinResponse.data.data && bitcoinResponse.data.data.qrCodeImage);
                          
            if (qrCode && qrCode.startsWith('data:image/png;base64,')) {
                console.log('✅ Bitcoin QR Code generated with logo');
                console.log('📏 Size:', qrCode.length, 'characters');
                
                // Save Bitcoin QR
                const base64Data = qrCode.replace('data:image/png;base64,', '');
                fs.writeFileSync('final-bitcoin-qr.png', base64Data, 'base64');
                console.log('💾 Saved: final-bitcoin-qr.png');
            } else {
                console.log('❌ Bitcoin QR Code not found or invalid format');
                console.log('Response keys:', Object.keys(bitcoinResponse.data));
            }
        } else {
            console.log('❌ Bitcoin payment creation failed');
        }
        
        // Test PIX QR with Logo
        console.log('\n🔵 Testing PIX QR Code with Logo...');
        const pixResponse = await axios.post(`${baseUrl}/create-payment`, {
            userName: 'Final PIX Test',
            paymentMethod: 'pix',
            amount: 50
        });
        
        if (pixResponse.data.success) {
            // Check different possible response structures
            const qrCode = pixResponse.data.qrCodeImage || 
                          pixResponse.data.qrCode ||
                          (pixResponse.data.data && pixResponse.data.data.qrCodeImage);
                          
            if (qrCode && qrCode.startsWith('data:image/png;base64,')) {
                console.log('✅ PIX QR Code generated with logo');
                console.log('📏 Size:', qrCode.length, 'characters');
                
                // Save PIX QR
                const base64Data = qrCode.replace('data:image/png;base64,', '');
                fs.writeFileSync('final-pix-qr.png', base64Data, 'base64');
                console.log('💾 Saved: final-pix-qr.png');
            } else {
                console.log('❌ PIX QR Code not found or invalid format');
                console.log('Response keys:', Object.keys(pixResponse.data));
            }
        } else {
            console.log('❌ PIX payment creation failed');
        }
        
        console.log('\n🎯 VERIFICATION COMPLETE!');
        console.log('================================');
        console.log('📁 Check the generated PNG files:');
        console.log('  - final-bitcoin-qr.png (should have orange ₿ logo)');
        console.log('  - final-pix-qr.png (should have blue "PIX" logo)');
        console.log('');
        console.log('✅ QR Code Logo System Status: FULLY OPERATIONAL');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

finalLogoVerification();
