// Test PIX payment in production to verify LiveTip API integration
const https = require('https');

async function testPixPayment() {
    const testData = {
        userName: 'TestUser',
        paymentMethod: 'pix',
        amount: '10.50',
        uniqueId: `test_pix_fix_${Date.now()}`
    };

    console.log('🧪 Testing PIX payment generation...');
    console.log('📡 Payload:', JSON.stringify(testData, null, 2));

    const postData = JSON.stringify(testData);
    
    const options = {
        hostname: 'livetip-webhook-integration.vercel.app',
        port: 443,
        path: '/generate-qr',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'PIX-Test-Client/1.0'
        },
        timeout: 30000
    };

    return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log(`📥 Response Status: ${response.statusCode}`);
                console.log(`📥 Response Data:`, data.substring(0, 500) + '...');
                
                try {
                    const result = JSON.parse(data);
                    
                    // Check if PIX is using LiveTip API
                    if (result.success && result.data) {
                        console.log('\n✅ SUCCESS DETAILS:');
                        console.log(`   Source: ${result.data.source}`);
                        console.log(`   Payment ID: ${result.data.paymentId}`);
                        console.log(`   PIX Code: ${result.data.pixCode ? result.data.pixCode.substring(0, 50) + '...' : 'NULL'}`);
                        
                        if (result.data.source === 'livetip-api') {
                            console.log('\n🎉 PIX is now using LiveTip API! (Fixed)');
                        } else {
                            console.log('\n⚠️ PIX is still using fallback:', result.data.source);
                        }
                    } else {
                        console.log('\n❌ API Error:', result.error || 'Unknown error');
                    }
                    
                    resolve(result);
                } catch (parseError) {
                    console.log('\n❌ JSON Parse Error:', parseError.message);
                    console.log('Raw response:', data);
                    reject(parseError);
                }
            });
        });

        request.on('timeout', () => { 
            request.destroy(); 
            reject(new Error('Request timeout')); 
        });
        
        request.on('error', (error) => { 
            console.log('\n❌ Request Error:', error.message);
            reject(error); 
        });
        
        request.write(postData);
        request.end();
    });
}

// Run the test
testPixPayment()
    .then(() => {
        console.log('\n🏁 Test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.log('\n💥 Test failed:', error.message);
        process.exit(1);
    });
