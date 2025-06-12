// Local verification: Test if PIX and Bitcoin endpoints work correctly locally
const http = require('http');

function testPayment(paymentMethod, amount) {
    return new Promise((resolve, reject) => {
        const testData = {
            userName: 'LocalTest',
            paymentMethod: paymentMethod,
            amount: amount,
            uniqueId: `local_${paymentMethod}_${Date.now()}`
        };

        const postData = JSON.stringify(testData);
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/create-payment',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 15000
        };

        const request = http.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`✅ ${paymentMethod.toUpperCase()} Payment: ${result.success ? 'success' : 'failed'}`);
                    console.log(`   Source: ${result.paymentData?.source || 'unknown'}`);
                    
                    if (paymentMethod === 'pix' && result.paymentData?.pixCode) {
                        console.log(`   PIX Code: ${result.paymentData.pixCode.substring(0, 30)}...`);
                    } else if (paymentMethod === 'bitcoin' && result.paymentData?.lightningInvoice) {
                        console.log(`   Lightning Invoice: ${result.paymentData.lightningInvoice.substring(0, 30)}...`);
                    }
                    
                    resolve(result);
                } catch (e) {
                    console.log(`❌ Error parsing ${paymentMethod} response:`, e.message);
                    reject(e);
                }
            });
        });

        request.on('error', (e) => {
            console.log(`❌ ${paymentMethod.toUpperCase()} failed: ${e.message}`);
            reject(e);
        });

        request.write(postData);
        request.end();
    });
}

async function verifyFixes() {
    console.log('🔍 LOCAL PIX AND BITCOIN VERIFICATION');
    console.log('===============================');

    try {
        console.log('🧪 Testing PIX payment...');
        const pixResult = await testPayment('pix', 2);
        
        console.log('🧪 Testing Bitcoin payment...');
        const bitcoinResult = await testPayment('bitcoin', 200);

        console.log('\n📊 FINAL RESULTS:');
        console.log('==================');
        console.log(`PIX Fix Status: ${pixResult.success ? '✅ FIXED' : '❌ NOT FIXED'}`);
        console.log(`Bitcoin Status: ${bitcoinResult.success ? '✅ WORKING' : '❌ NOT WORKING'}`);
        
        if (pixResult.success && bitcoinResult.success) {
            console.log('\n🎉 ALL TESTS PASSED! System is ready for production deployment.');
        } else {
            console.log('\n⚠️ Some tests failed. Please fix issues before deploying to production.');
        }
    } catch (error) {
        console.log('❌ Error during verification:', error.message);
    }
}

// Run the verification
console.log('Starting verification...');
verifyFixes().catch(error => {
    console.error('Error in main function:', error);
});
