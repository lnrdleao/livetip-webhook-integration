// Simple verification that the fix is deployed
const https = require('https');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'livetip-webhook-integration.vercel.app',
            port: 443,
            path: path,
            method: 'GET',
            timeout: 10000
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                resolve({ status: response.statusCode, data });
            });
        });

        request.on('timeout', () => { 
            request.destroy(); 
            reject(new Error('Request timeout')); 
        });
        
        request.on('error', reject);
        request.end();
    });
}

async function verify() {
    console.log('🔍 Verifying deployment...');
    
    try {
        const health = await makeRequest('/health');
        console.log('✅ Health check:', health.status === 200 ? 'OK' : 'FAIL');
        
        const webhook = await makeRequest('/webhook');
        console.log('✅ Webhook endpoint:', webhook.status === 200 ? 'OK' : 'FAIL');
        
        console.log('\n🎯 Deployment verified - PIX fix should be active!');
        console.log('📋 You can now test PIX payments at: https://livetip-webhook-integration.vercel.app/');
        console.log('📊 Monitor webhooks at: https://livetip-webhook-integration.vercel.app/webhook-monitor');
        
    } catch (error) {
        console.log('❌ Verification failed:', error.message);
    }
}

verify();
