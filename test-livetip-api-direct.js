// Teste direto da API LiveTip para diagnosticar o problema
const https = require('https');

async function testLiveTipAPI() {
    console.log('🔧 Testando API LiveTip diretamente...\n');

    // Teste 1: PIX
    console.log('1️⃣ TESTANDO PIX:');
    try {
        const pixPayload = {
            sender: "João Teste",
            content: "Teste PIX LiveTip",
            currency: "BRL",
            amount: "2.00"
        };

        const pixResult = await callLiveTipAPI(pixPayload);
        console.log('✅ PIX Response:', JSON.stringify(pixResult, null, 2));
        
        if (pixResult.code) {
            console.log('📄 PIX Code length:', pixResult.code.length);
            console.log('📄 PIX Code preview:', pixResult.code.substring(0, 100) + '...');
        }
    } catch (error) {
        console.error('❌ PIX Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 2: Bitcoin
    console.log('2️⃣ TESTANDO BITCOIN:');
    try {
        const btcPayload = {
            sender: "João Teste",
            content: "BTC_1733807100000_abc123",
            currency: "BTC",
            amount: "100"
        };

        const btcResult = await callLiveTipAPI(btcPayload);
        console.log('✅ BTC Response:', JSON.stringify(btcResult, null, 2));
        
        if (btcResult.code) {
            console.log('⚡ Lightning Invoice length:', btcResult.code.length);
            console.log('⚡ Lightning Invoice preview:', btcResult.code.substring(0, 100) + '...');
            console.log('⚡ Starts with lnbc?', btcResult.code.startsWith('lnbc'));
        }
    } catch (error) {
        console.error('❌ BTC Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 3: Verificar se o endpoint está correto
    console.log('3️⃣ TESTANDO ENDPOINTS ALTERNATIVOS:');
    
    const endpoints = [
        '/api/v1/message/10',
        '/api/v1/payments',
        '/api/v1/lightning/invoice',
        '/api/v1/pix/create'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`🔍 Testando endpoint: ${endpoint}`);
            const testResult = await callLiveTipAPI({
                sender: "Teste",
                content: "Teste endpoint",
                currency: "BRL",
                amount: "1.00"
            }, endpoint);
            console.log(`✅ ${endpoint}: OK`);
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }
}

function callLiveTipAPI(payload, endpoint = '/api/v1/message/10') {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(payload);
        
        const options = {
            hostname: 'api.livetip.gg',
            port: 443,
            path: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'LiveTip-Test/1.0'
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log(`📡 Status: ${res.statusCode}`);
                console.log(`📦 Headers:`, res.headers);
                
                if (res.statusCode === 200 || res.statusCode === 201) {
                    try {
                        const parsedData = JSON.parse(data);
                        resolve(parsedData);
                    } catch (parseError) {
                        console.log('📦 Raw response:', data);
                        resolve({ raw: data, error: 'JSON Parse failed' });
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Executar teste
testLiveTipAPI().then(() => {
    console.log('\n🎯 Teste concluído!');
}).catch(error => {
    console.error('❌ Erro geral:', error);
});
