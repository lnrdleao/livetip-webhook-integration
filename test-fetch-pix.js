// Teste direto da API usando fetch
async function testPixAPI() {
    console.log('🧪 Testando API PIX diretamente...');
    
    const url = 'https://livetip-webhook-integration-leonardos-projects-b4a462ee.vercel.app/generate-qr';
    
    const payload = {
        userName: 'Usuario Teste',
        amount: 2,
        paymentMethod: 'pix'
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Resposta:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('✅ PIX gerado com sucesso!');
            console.log('Fonte:', data.data.source);
            console.log('PIX Code:', data.data.pixCode?.substring(0, 50) + '...');
        } else {
            console.log('❌ Erro:', data.error);
        }
        
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
    }
}

// Para Node.js
if (typeof window === 'undefined') {
    const https = require('https');
    global.fetch = require('node-fetch');
}

testPixAPI();
