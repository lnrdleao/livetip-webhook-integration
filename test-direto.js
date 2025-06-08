// Teste super direto da API LiveTip
const https = require('https');

console.log('🧪 Teste direto API LiveTip com valores corretos...');

const postData = JSON.stringify({
    sender: "Leonardo",
    content: "BTC_TEST_DIRETO",
    currency: "BTC",
    amount: "200"  // 200 satoshis como string
});

console.log('📤 Payload:', postData);

const options = {
    hostname: 'api.livetip.gg',
    port: 443,
    path: '/api/v1/message/10',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('📄 Resposta:', data);
        
        try {
            const json = JSON.parse(data);
            console.log('✅ JSON parsed:', json);
            
            if (json.code) {
                console.log('⚡ Lightning Invoice encontrado!');
                console.log('Invoice (50 chars):', json.code.substring(0, 50) + '...');
            }
        } catch (e) {
            console.log('❌ Não é JSON:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`💥 Erro: ${e.message}`);
});

req.write(postData);
req.end();

console.log('📡 Requisição enviada...');
