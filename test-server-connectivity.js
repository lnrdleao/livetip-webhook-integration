console.log('🧪 Direct Server Test...');

const fetch = require('node-fetch');

async function testServer() {
    try {
        console.log('📡 Testing server connectivity...');
        
        const response = await fetch('http://localhost:3001/payments');
        console.log('📊 Status:', response.status);
        
        if (response.ok) {
            console.log('✅ Server is responding!');
            const data = await response.json();
            console.log('📋 Payments count:', data.length || 0);
        } else {
            console.log('❌ Server error:', response.statusText);
        }
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
    }
}

testServer();
