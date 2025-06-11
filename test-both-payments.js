// Test both PIX and Bitcoin payments to verify API integration
const https = require('https');

async function testPaymentMethod(paymentMethod, amount) {
    const testData = {
        userName: 'TestUser',
        paymentMethod: paymentMethod,
        amount: amount,
        uniqueId: `test_${paymentMethod}_${Date.now()}`
    };

    console.log(`\n🧪 Testing ${paymentMethod.toUpperCase()} payment generation...`);
    
    const postData = JSON.stringify(testData);
    
    const options = {
        hostname: 'livetip-webhook-integration.vercel.app',
        port: 443,
        path: '/generate-qr',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Payment-Test-Client/1.0'
        },
        timeout: 15000
    };

    return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    
                    if (result.success && result.data) {
                        console.log(`✅ ${paymentMethod.toUpperCase()} SUCCESS:`);
                        console.log(`   Source: ${result.data.source}`);
                        console.log(`   Payment ID: ${result.data.paymentId}`);
                        
                        if (paymentMethod === 'pix') {
                            console.log(`   PIX Code: ${result.data.pixCode ? result.data.pixCode.substring(0, 50) + '...' : 'NULL'}`);
                        } else {
                            console.log(`   Lightning Invoice: ${result.data.lightningInvoice ? result.data.lightningInvoice.substring(0, 50) + '...' : 'NULL'}`);
                        }
                        
                        if (result.data.source === 'livetip-api') {
                            console.log(`   🎉 ${paymentMethod.toUpperCase()} is using LiveTip API!`);
                        } else {
                            console.log(`   ⚠️ ${paymentMethod.toUpperCase()} is using: ${result.data.source}`);
                        }
                    } else {
                        console.log(`❌ ${paymentMethod.toUpperCase()} Error:`, result.error || 'Unknown error');
                    }
                    
                    resolve(result);
                } catch (parseError) {
                    console.log(`❌ ${paymentMethod.toUpperCase()} Parse Error:`, parseError.message);
                    reject(parseError);
                }
            });
        });

        request.on('timeout', () => { 
            request.destroy(); 
            reject(new Error('Request timeout')); 
        });
        
        request.on('error', (error) => { 
            reject(error); 
        });
        
        request.write(postData);
        request.end();
    });
}

async function runTests() {
    console.log('🚀 Starting Payment API Tests...');
    
    try {
        // Test PIX
        await testPaymentMethod('pix', '10.50');
        
        // Wait a moment between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test Bitcoin
        await testPaymentMethod('bitcoin', '1000');
        
        console.log('\n🏁 All tests completed successfully!');
        
    } catch (error) {
        console.log('\n💥 Test failed:', error.message);
    }
}

runTests();
