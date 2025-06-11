const http = require('http');

console.log('🏦 Testing PIX QR Code with Logo...');

const postData = JSON.stringify({
    userName: 'PIX Logo Test',
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
                    
                    console.log('\n🎉 PIX QR Code Logo Test Complete!');
                    console.log('📁 Check pix-qr-test.png to verify the PIX logo is embedded.');
                } else {
                    console.log('❌ No PIX QR code image found');
                    console.log('Response keys:', Object.keys(response));
                }
            } else {
                console.log('❌ PIX Payment creation failed');
                console.log('Error:', response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('❌ Failed to parse PIX response:', error.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ PIX Request error:', error.message);
});

req.write(postData);
req.end();
