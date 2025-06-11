// Comprehensive test to verify PIX fix is working with LiveTip API
const https = require('https');

async function testPixPayment() {
    console.log('🧪 Testing PIX payment with LiveTip API integration...\n');
    
    const testData = {
        userName: 'TestUser',
        paymentMethod: 'pix',
        amount: '25.00',
        uniqueId: `pix_fix_test_${Date.now()}`
    };
    
    console.log('📡 Request payload:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n⏳ Calling production API...');
    
    const postData = JSON.stringify(testData);
    
    const options = {
        hostname: 'livetip-webhook-integration.vercel.app',
        port: 443,
        path: '/generate-qr',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'PIX-Fix-Test-Client/1.0'
        },
        timeout: 30000
    };

    return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log(`📥 Response Status: ${response.statusCode}`);
                
                try {
                    const result = JSON.parse(data);
                    
                    console.log('\n📊 RESPONSE ANALYSIS:');
                    console.log('=====================================');
                    
                    if (result.success && result.data) {
                        console.log(`✅ Success: ${result.success}`);
                        console.log(`📍 Source: ${result.data.source}`);
                        console.log(`🆔 Payment ID: ${result.data.paymentId}`);
                        console.log(`👤 User: ${result.data.userName}`);
                        console.log(`💰 Amount: R$ ${result.data.amount}`);
                        console.log(`⏰ Created: ${result.data.createdAt}`);
                        
                        if (result.data.pixCode) {
                            console.log(`📄 PIX Code Length: ${result.data.pixCode.length} chars`);
                            console.log(`📄 PIX Code Preview: ${result.data.pixCode.substring(0, 60)}...`);
                            
                            // Validate PIX code format
                            if (result.data.pixCode.length >= 50 && result.data.pixCode.startsWith('00020126')) {
                                console.log('✅ PIX code format: VALID');
                            } else {
                                console.log('⚠️ PIX code format: POTENTIALLY INVALID');
                            }
                        }
                        
                        console.log('\n🎯 FIX STATUS VERIFICATION:');
                        console.log('=====================================');
                        
                        if (result.data.source === 'livetip-api') {
                            console.log('🎉 SUCCESS! PIX is now using LiveTip API!');
                            console.log('✅ The PIX fix has been successfully deployed and is working!');
                        } else if (result.data.source === 'fallback-local') {
                            console.log('⚠️ PIX is still using local fallback');
                            console.log('❌ The PIX fix may not be fully deployed yet');
                        } else {
                            console.log(`ℹ️ PIX is using: ${result.data.source}`);
                        }
                        
                    } else {
                        console.log('❌ API Error:');
                        console.log(JSON.stringify(result, null, 2));
                    }
                    
                    resolve(result);
                } catch (parseError) {
                    console.log('❌ JSON Parse Error:', parseError.message);
                    console.log('Raw response:', data.substring(0, 200) + '...');
                    reject(parseError);
                }
            });
        });

        request.on('timeout', () => { 
            request.destroy(); 
            reject(new Error('Request timeout')); 
        });
        
        request.on('error', (error) => { 
            console.log('❌ Request Error:', error.message);
            reject(error); 
        });
        
        request.write(postData);
        request.end();
    });
}

async function testBitcoinPayment() {
    console.log('\n\n🧪 Testing Bitcoin payment for comparison...\n');
    
    const testData = {
        userName: 'TestUser',
        paymentMethod: 'bitcoin',
        amount: '1000',
        uniqueId: `btc_test_${Date.now()}`
    };
    
    console.log('📡 Request payload:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n⏳ Calling production API...');
    
    const postData = JSON.stringify(testData);
    
    const options = {
        hostname: 'livetip-webhook-integration.vercel.app',
        port: 443,
        path: '/generate-qr',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Bitcoin-Test-Client/1.0'
        },
        timeout: 30000
    };

    return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log(`📥 Response Status: ${response.statusCode}`);
                
                try {
                    const result = JSON.parse(data);
                    
                    if (result.success && result.data) {
                        console.log(`✅ Bitcoin Success - Source: ${result.data.source}`);
                        if (result.data.lightningInvoice) {
                            console.log(`⚡ Lightning Invoice: ${result.data.lightningInvoice.substring(0, 50)}...`);
                        }
                    } else {
                        console.log('❌ Bitcoin Error:', result.error || 'Unknown error');
                    }
                    
                    resolve(result);
                } catch (parseError) {
                    console.log('❌ Bitcoin Parse Error:', parseError.message);
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

async function runComprehensiveTest() {
    console.log('🚀 STARTING COMPREHENSIVE PIX FIX TEST');
    console.log('==========================================\n');
    
    try {
        // Test PIX
        await testPixPayment();
        
        // Wait a moment between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test Bitcoin for comparison
        await testBitcoinPayment();
        
        console.log('\n\n🏁 COMPREHENSIVE TEST COMPLETED');
        console.log('=====================================');
        console.log('✅ Both payment methods tested successfully');
        console.log('📊 Check the results above to verify PIX fix status');
        
    } catch (error) {
        console.log('\n💥 Test failed:', error.message);
    }
}

runComprehensiveTest();
