// Final verification: Test if PIX now uses LiveTip API
const https = require('https');

function testPayment(paymentMethod, amount) {
    return new Promise((resolve, reject) => {
        const testData = {
            userName: 'FinalTest',
            paymentMethod: paymentMethod,
            amount: amount,
            uniqueId: `final_${paymentMethod}_${Date.now()}`
        };

        const postData = JSON.stringify(testData);
        
        const options = {
            hostname: 'livetip-webhook-integration.vercel.app',
            port: 443,
            path: '/generate-qr',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 15000
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });

        request.on('timeout', () => { 
            request.destroy(); 
            reject(new Error('Timeout')); 
        });
        
        request.on('error', reject);
        request.write(postData);
        request.end();
    });
}

async function finalVerification() {
    console.log('🔍 FINAL PIX FIX VERIFICATION');
    console.log('===============================\n');

    try {
        // Test PIX
        console.log('🧪 Testing PIX...');
        const pixResult = await testPayment('pix', '15.75');
        
        if (pixResult.success && pixResult.data) {
            console.log(`✅ PIX Payment: ${pixResult.data.source}`);
            
            if (pixResult.data.source === 'livetip-api') {
                console.log('🎉 SUCCESS! PIX is using LiveTip API');
            } else {
                console.log('⚠️ PIX is using:', pixResult.data.source);
            }
        } else {
            console.log('❌ PIX failed:', pixResult.error);
        }

        console.log('');

        // Test Bitcoin
        console.log('🧪 Testing Bitcoin...');
        const btcResult = await testPayment('bitcoin', '500');
        
        if (btcResult.success && btcResult.data) {
            console.log(`✅ Bitcoin Payment: ${btcResult.data.source}`);
        } else {
            console.log('❌ Bitcoin failed:', btcResult.error);
        }

        console.log('\n📊 FINAL RESULTS:');
        console.log('==================');
        
        const pixFixed = pixResult.success && pixResult.data.source === 'livetip-api';
        const btcWorking = btcResult.success && btcResult.data.source === 'livetip-api';
        
        console.log(`PIX Fix Status: ${pixFixed ? '✅ FIXED' : '❌ NOT FIXED'}`);
        console.log(`Bitcoin Status: ${btcWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
        
        if (pixFixed && btcWorking) {
            console.log('\n🎊 MISSION ACCOMPLISHED!');
            console.log('Both PIX and Bitcoin are using LiveTip API successfully!');
        } else if (pixFixed) {
            console.log('\n🎯 PIX FIX SUCCESSFUL!');
            console.log('PIX is now using LiveTip API as intended!');
        }

    } catch (error) {
        console.log('❌ Verification failed:', error.message);
    }
}

finalVerification();
