// Test PIX API with corrected JSON parsing
const https = require('https');

async function testPIXFix() {
    console.log('🧪 Testing PIX with corrected JSON parsing...');
    
    const payload = {
        sender: "Test PIX User",
        content: "Pagamento LiveTip - R$ 2.00",
        currency: "BRL",
        amount: "2.00"
    };

    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(payload);
        
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
            timeout: 30000
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log('📥 LiveTip API Response (' + response.statusCode + '):', data.substring(0, 100) + '...');
                
                if (response.statusCode === 200 || response.statusCode === 201) {
                    try {
                        // Parse as JSON (the fix we applied)
                        const parsedData = JSON.parse(data);
                        console.log('✅ Resposta JSON da LiveTip:', JSON.stringify(parsedData, null, 2));
                        
                        const pixCodeFromApi = parsedData.code;
                        console.log('✅ Código PIX recebido da LiveTip:', pixCodeFromApi ? pixCodeFromApi.substring(0, 50) + '...' : 'NULL');
                        
                        if (!pixCodeFromApi || pixCodeFromApi.length < 50) {
                            throw new Error('Código PIX inválido recebido da API');
                        }
                        
                        resolve({ 
                            code: pixCodeFromApi, 
                            pixCode: pixCodeFromApi,
                            id: parsedData.id || 'test_id',
                            source: 'livetip_api'
                        });
                    } catch (parseError) {
                        reject(new Error('JSON Parse Error: ' + parseError.message));
                    }
                } else {
                    reject(new Error('HTTP ' + response.statusCode + ': ' + data));
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
testPIXFix()
    .then((result) => {
        console.log('🎉 PIX Test SUCCESS!');
        console.log('📊 Result:', result);
        console.log('🔍 Source:', result.source);
        console.log('📄 PIX Code Length:', result.pixCode.length);
        console.log('✅ Fix is working correctly - PIX will now use LiveTip API instead of fallback!');
    })
    .catch((error) => {
        console.error('❌ PIX Test FAILED:', error.message);
    });
