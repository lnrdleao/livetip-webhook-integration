const http = require('http');

function testQRGeneration() {
    console.log('🎯 Testing QR Code Generation with Logos...');
    
    const postData = JSON.stringify({
        userName: 'Test Bitcoin Logo',
        paymentMethod: 'bitcoin',
        amount: 100
    });
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/create-payment',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    console.log('📱 Creating Bitcoin payment request...');
    
    const req = http.request(options, (res) => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('✅ Response received');
                
                if (response.success) {
                    console.log('🎉 Payment created successfully!');
                    
                    // Check for QR code image in different possible locations
                    const qrCodeImage = response.qrCodeImage || 
                                      (response.data && response.data.qrCodeImage) ||
                                      (response.paymentData && response.paymentData.qrCodeImage);
                    
                    if (qrCodeImage) {
                        console.log('🖼️ QR Code with logo generated!');
                        console.log('📏 QR Code data length:', qrCodeImage.length);
                        console.log('🔍 Data URL type:', qrCodeImage.substring(0, 30));
                        
                        // Save to file for inspection
                        const fs = require('fs');
                        if (qrCodeImage.includes('data:image')) {
                            const base64Data = qrCodeImage.split(',')[1];
                            fs.writeFileSync('bitcoin-qr-test.png', base64Data, 'base64');
                            console.log('💾 QR code saved as bitcoin-qr-test.png');
                        }
                    } else {
                        console.log('❌ No QR code image found in response');
                        console.log('📋 Available keys:', Object.keys(response));
                    }
                } else {
                    console.log('❌ Payment creation failed');
                    console.log('Error:', response.error || 'Unknown error');
                }
            } catch (error) {
                console.error('❌ Failed to parse response:', error.message);
                console.log('Raw response:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Request error:', error.message);
    });
    
    req.write(postData);
    req.end();
}

// Test Bitcoin payment
testQRGeneration();

// Test PIX payment after 2 seconds
setTimeout(() => {
    console.log('\n🏦 Testing PIX payment...');
    
    const postData = JSON.stringify({
        userName: 'Test PIX Logo',
        paymentMethod: 'pix',
        amount: 25.50
    });
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/create-payment',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const req = http.request(options, (res) => {
        console.log(`📊 PIX Status Code: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('✅ PIX Response received');
                
                if (response.success) {
                    console.log('🎉 PIX Payment created successfully!');
                    
                    const qrCodeImage = response.qrCodeImage || 
                                      (response.data && response.data.qrCodeImage) ||
                                      (response.paymentData && response.paymentData.qrCodeImage);
                    
                    if (qrCodeImage) {
                        console.log('🖼️ PIX QR Code with logo generated!');
                        console.log('📏 PIX QR Code data length:', qrCodeImage.length);
                        
                        // Save PIX QR code
                        const fs = require('fs');
                        if (qrCodeImage.includes('data:image')) {
                            const base64Data = qrCodeImage.split(',')[1];
                            fs.writeFileSync('pix-qr-test.png', base64Data, 'base64');
                            console.log('💾 PIX QR code saved as pix-qr-test.png');
                        }
                        
                        console.log('\n🎉 QR Code Logo Test Complete!');
                        console.log('📁 Check the generated PNG files to verify logos are embedded correctly.');
                    }
                }
            } catch (error) {
                console.error('❌ Failed to parse PIX response:', error.message);
            }
        });
    });
    
    req.write(postData);
    req.end();
}, 2000);
