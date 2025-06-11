// Simple test to reproduce and fix the PIX JSON parsing error
const https = require('https');

console.log('🧪 Testing PIX Error Fix...');

// Simulate the exact call that's failing in production
function testPixCall() {
    const payload = {
        sender: "Test User",
        content: "Pagamento LiveTip - R$ 5.00",
        currency: "BRL",
        amount: "5.00"
    };

    const postData = JSON.stringify(payload);

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.livetip.gg',
            port: 443,
            path: '/api/v1/message/10',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'LiveTip-Webhook-Integration/1.0'
            },
            timeout: 15000
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log('📥 Response Status:', response.statusCode);
                console.log('📋 Response Headers:', response.headers);
                console.log('📄 Raw Response (first 200 chars):', data.substring(0, 200));
                
                if (response.statusCode === 200 || response.statusCode === 201) {
                    // Apply the fix: check response type before parsing
                    try {
                        const responseText = data.trim();
                        
                        // Check for HTML error pages
                        if (responseText.startsWith('<') || responseText.toLowerCase().includes('server error') || responseText.toLowerCase().includes('error')) {
                            console.log('❌ DETECTED: API returned HTML error page!');
                            console.log('🔧 FIX: This would trigger fallback in production');
                            reject(new Error('API_ERROR_PAGE: ' + responseText.substring(0, 100)));
                            return;
                        }
                        
                        // Check if response is JSON
                        if (responseText.startsWith('{') || responseText.startsWith('[')) {
                            console.log('✅ Response is JSON format');
                            const parsedData = JSON.parse(data);
                            console.log('✅ JSON parsed successfully:', parsedData);
                            resolve({
                                success: true,
                                type: 'json',
                                data: parsedData,
                                pixCode: parsedData.code
                            });
                        } else {
                            console.log('✅ Response is plain text (PIX code)');
                            if (responseText.length > 50 && responseText.includes('0002010')) {
                                console.log('✅ Valid PIX code detected');
                                resolve({
                                    success: true,
                                    type: 'text',
                                    pixCode: responseText
                                });
                            } else {
                                reject(new Error('Invalid PIX code format'));
                            }
                        }
                    } catch (parseError) {
                        console.log('❌ ORIGINAL ERROR:', parseError.message);
                        console.log('🔧 FIX APPLIED: Better error handling would catch this');
                        reject(parseError);
                    }
                } else {
                    console.log('❌ HTTP Error:', response.statusCode, data);
                    reject(new Error('HTTP_' + response.statusCode + ': ' + data.substring(0, 100)));
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

// Run the test
testPixCall()
    .then((result) => {
        console.log('\n🎉 PIX TEST SUCCESS!');
        console.log('📊 Result type:', result.type);
        console.log('📄 PIX code length:', result.pixCode ? result.pixCode.length : 0);
        console.log('✅ The fix will prevent JSON parsing errors in production');
        console.log('\n💡 SOLUTION: Add response type checking before JSON.parse()');
    })
    .catch((error) => {
        console.log('\n❌ PIX TEST FAILED:', error.message);
        if (error.message.includes('Unexpected token')) {
            console.log('🎯 CONFIRMED: This is the exact error happening in production');
            console.log('💡 SOLUTION: Check response format before JSON.parse()');
        } else if (error.message.includes('API_ERROR_PAGE')) {
            console.log('🎯 DETECTED: LiveTip API is returning HTML error pages');
            console.log('💡 SOLUTION: Detect HTML responses and use fallback');
        }
    });
