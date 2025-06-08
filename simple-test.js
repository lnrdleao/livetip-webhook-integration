// Simple webhook test using native Node.js http module
const http = require('http');

// Test webhook function
function testWebhook(testName, payload, token = '2400613d5c2fb33d76e76c298d1dab4c') {
    return new Promise((resolve, reject) => {
        console.log(`\n🧪 Testing: ${testName}`);
        console.log('📤 Payload:', JSON.stringify(payload, null, 2));
        
        const data = JSON.stringify(payload);
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livetip-Webhook-Secret-Token': token,
                'Content-Length': Buffer.byteLength(data)
            }
        };        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${responseData}`);
                resolve({ status: res.statusCode, data: responseData });
            });
        });

        req.on('error', (err) => {
            console.error(`Error: ${err.message}`);
            reject(err);
        });

        req.write(data);
        req.end();
    });
}

// Test monitoring endpoints
function testMonitoring(endpoint) {
    return new Promise((resolve, reject) => {
        console.log(`\n📊 Testing monitoring endpoint: ${endpoint}`);
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: endpoint,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${responseData.substring(0, 200)}...`);
                resolve({ status: res.statusCode, data: responseData });
            });
        });

        req.on('error', (err) => {
            console.error(`Error: ${err.message}`);
            reject(err);
        });

        req.end();
    });
}

// Run tests
async function runTests() {
    console.log('🚀 Starting LiveTip Webhook Tests...\n');
    
    try {        // Test 1: Valid payment_confirmed event
        await testWebhook('Valid Payment Confirmed', {
            event: 'payment_confirmed',
            payment: {
                sender: 'testuser',
                receiver: 'merchant',
                content: 'Test payment - External ID: EXT_001',
                amount: 10.50,
                currency: 'BRL',
                timestamp: new Date().toISOString(),
                paid: true,
                paymentId: 'LIVETIP_123',
                read: true
            }
        });

        // Test 2: Invalid token
        await testWebhook('Invalid Token', {
            event: 'payment_confirmed',
            payment: {
                sender: 'testuser2',
                receiver: 'merchant',
                content: 'Test payment 2',
                amount: 5.00,
                currency: 'BRL',
                timestamp: new Date().toISOString(),
                paid: true,
                paymentId: 'LIVETIP_456',
                read: true
            }
        }, 'invalid_token');

        // Test 3: Payment pending event
        await testWebhook('Payment Pending', {
            event: 'payment_pending',
            payment: {
                sender: 'pendinguser',
                receiver: 'merchant',
                content: 'Pending payment test',
                amount: 25.00,
                currency: 'BRL',
                timestamp: new Date().toISOString(),
                paid: false,
                paymentId: 'LIVETIP_789',
                read: false
            }
        });

        // Test 4: Test monitoring endpoints
        await testMonitoring('/webhook-logs');
        await testMonitoring('/webhook-stats');
        await testMonitoring('/payments');

        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

runTests();
