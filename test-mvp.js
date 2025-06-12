// Test script for LiveTip MVP
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_TOKEN = '0ac7b9aa00e75e0215243f3bb177c844';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        status: res.statusCode,
                        headers: res.headers,
                        data: body ? JSON.parse(body) : null
                    };
                    resolve(result);
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testHealthCheck() {
    console.log('\n=== Testing Health Check ===');
    
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/health',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
        if (response.status === 200 && response.data.status === 'ok') {
            console.log('✅ Health check passed');
            return true;
        } else {
            console.log('❌ Health check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Health check error:', error.message);
        return false;
    }
}

async function testCreatePayment() {
    console.log('\n=== Testing Payment Creation ===');
    
    try {
        const paymentData = {
            nome: 'Test User MVP',
            valor: 25
        };
        
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/generate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, paymentData);
        
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Payment creation passed');
            return response.data.id;
        } else {
            console.log('❌ Payment creation failed');
            return null;
        }
    } catch (error) {
        console.log('❌ Payment creation error:', error.message);
        return null;
    }
}

async function testPaymentStatus(paymentId) {
    console.log('\n=== Testing Payment Status Check ===');
    
    if (!paymentId) {
        console.log('❌ No payment ID provided');
        return false;
    }
    
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: `/status/${paymentId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
        if (response.status === 200 && response.data.status === 'pending') {
            console.log('✅ Payment status check passed');
            return true;
        } else {
            console.log('❌ Payment status check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Payment status error:', error.message);
        return false;
    }
}

async function testWebhook(paymentId) {
    console.log('\n=== Testing Webhook Confirmation ===');
    
    if (!paymentId) {
        console.log('❌ No payment ID provided');
        return false;
    }
    
    try {
        const webhookData = {
            id: paymentId,
            type: 'payment_confirmed',
            timestamp: new Date().toISOString()
        };
        
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livetip-Webhook-Secret-Token': WEBHOOK_TOKEN
            }
        }, webhookData);
        
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Webhook confirmation passed');
            return true;
        } else {
            console.log('❌ Webhook confirmation failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Webhook error:', error.message);
        return false;
    }
}

async function testPaymentStatusAfterWebhook(paymentId) {
    console.log('\n=== Testing Payment Status After Webhook ===');
    
    if (!paymentId) {
        console.log('❌ No payment ID provided');
        return false;
    }
    
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: `/status/${paymentId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
        if (response.status === 200 && response.data.status === 'confirmed') {
            console.log('✅ Payment status after webhook passed');
            return true;
        } else {
            console.log('❌ Payment status after webhook failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Payment status after webhook error:', error.message);
        return false;
    }
}

async function testInvalidWebhookToken(paymentId) {
    console.log('\n=== Testing Invalid Webhook Token ===');
    
    if (!paymentId) {
        console.log('❌ No payment ID provided');
        return false;
    }
    
    try {
        const webhookData = {
            id: paymentId,
            type: 'payment_confirmed'
        };
        
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livetip-Webhook-Secret-Token': 'invalid-token'
            }
        }, webhookData);
        
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
        if (response.status === 401) {
            console.log('✅ Invalid token test passed (correctly rejected)');
            return true;
        } else {
            console.log('❌ Invalid token test failed (should have been rejected)');
            return false;
        }
    } catch (error) {
        console.log('❌ Invalid token test error:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Starting LiveTip MVP Tests...\n');
    console.log('Make sure the server is running on localhost:3000');
    console.log('Run: node index.js or npm start\n');
    
    let results = [];
    
    // Test 1: Health Check
    results.push(await testHealthCheck());
    
    // Test 2: Create Payment
    const paymentId = await testCreatePayment();
    results.push(paymentId !== null);
    
    if (paymentId) {
        // Test 3: Check Payment Status (should be pending)
        results.push(await testPaymentStatus(paymentId));
        
        // Test 4: Test Invalid Webhook Token
        results.push(await testInvalidWebhookToken(paymentId));
        
        // Test 5: Send Webhook Confirmation
        results.push(await testWebhook(paymentId));
        
        // Test 6: Check Payment Status After Webhook (should be confirmed)
        results.push(await testPaymentStatusAfterWebhook(paymentId));
    }
    
    // Summary
    console.log('\n=== TEST RESULTS ===');
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`Tests passed: ${passed}/${total}`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! MVP is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the output above.');
    }
    
    if (paymentId) {
        console.log(`\n📝 Test Payment ID: ${paymentId}`);
        console.log(`📍 You can manually test at: http://localhost:3000`);
    }
}

// Run tests
runAllTests().catch(console.error);
