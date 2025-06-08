// Teste simples da API LiveTip
console.log('Testando API LiveTip...');

const https = require('https');

const postData = JSON.stringify({
    sender: "Teste",
    content: "BTC_TEST_123",
    currency: "BTC", 
    amount: "0.000001"
});

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
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Resposta completa:', data);
        try {
            const json = JSON.parse(data);
            console.log('JSON parsed:', json);
        } catch (e) {
            console.log('Não é JSON válido');
        }
    });
});

req.on('error', (e) => {
    console.error(`Erro: ${e.message}`);
});

req.write(postData);
req.end();
