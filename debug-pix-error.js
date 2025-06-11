// Test to debug the PIX error
const https = require('https');

async function debugPixError() {
    console.log('🔍 Debugging PIX API Error...');
    
    const payload = {
        sender: "Test User",
        content: "Pagamento LiveTip - R$ 5.00",
        currency: "BRL",
        amount: "5.00"
    };

    const postData = JSON.stringify(payload);
    console.log('📤 Sending payload:', postData);

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.livetip.gg',
            port: 443,
            path: '/api/v1/message/10',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'LiveTip-Debug/1.0'
            },
            timeout: 15000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log('📡 Status Code:', res.statusCode);
                console.log('📋 Headers:', res.headers);
                console.log('📄 Response Length:', data.length);
                console.log('📄 Raw Response (first 500 chars):', data.substring(0, 500));
                
                // Check if it starts with HTML
                if (data.trim().startsWith('<') || data.trim().startsWith('<!')) {
                    console.log('❌ Response is HTML (error page), not JSON or PIX code');
                    console.log('🔍 This explains the JSON parse error!');
                    reject(new Error('API returned HTML error page: ' + data.substring(0, 100)));
                    return;
                }
                
                // Check if it's JSON
                if (data.trim().startsWith('{')) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log('✅ Valid JSON response:', parsed);
                        resolve(parsed);
                    } catch (parseError) {
                        console.log('❌ JSON parse failed:', parseError.message);
                        reject(parseError);
                    }
                } else {
                    // Plain text response (PIX code)
                    console.log('✅ Plain text response (PIX code)');
                    resolve({ code: data.trim(), type: 'text' });
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            console.log('❌ Request timeout');
            reject(new Error('Request timeout'));
        });

        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Run the debug test
debugPixError()
    .then((result) => {
        console.log('\n🎉 DEBUG SUCCESS!');
        console.log('📊 Result type:', result.type || 'json');
        if (result.code) {
            console.log('📄 Code length:', result.code.length);
            console.log('📄 Code preview:', result.code.substring(0, 100) + '...');
        }
    })
    .catch((error) => {
        console.log('\n❌ DEBUG FAILED:', error.message);
        console.log('\n💡 SOLUTION: The API is returning an error page instead of PIX code.');
        console.log('💡 We need to implement better error handling in production.');
    });
