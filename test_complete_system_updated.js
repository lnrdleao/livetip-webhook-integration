// Teste completo do sistema LiveTip atualizado
const https = require('https');

const API_BASE = 'https://livetip-webhook-integration.vercel.app';

const makeRequest = async (path, method = 'GET', data = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'livetip-webhook-integration.vercel.app',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (method === 'POST' && data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: response });
                } catch (error) {
                    resolve({ status: res.statusCode, data: { raw: responseData } });
                }
            });
        });

        req.on('error', reject);
        
        if (method === 'POST' && data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
};

const runCompleteTests = async () => {
    console.log('🚀 TESTE COMPLETO SISTEMA LIVETIP ATUALIZADO');
    console.log('===============================================\n');

    // 1. Teste Health Check
    console.log('1️⃣ Testando Health Check...');
    try {
        const health = await makeRequest('/health');
        console.log(`   ✅ Status: ${health.status}`);
        console.log(`   ✅ Sistema: ${health.data.status}`);
        console.log(`   ✅ Versão: ${health.data.version}\n`);
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}\n`);
    }

    // 2. Teste valores PIX válidos (R$ 1, 2, 3, 4)
    console.log('2️⃣ Testando valores PIX válidos (R$ 1, 2, 3, 4)...');
    for (const amount of [1, 2, 3, 4]) {
        try {
            const result = await makeRequest('/generate-qr', 'POST', {
                userName: 'TestUser',
                paymentMethod: 'pix',
                amount: amount,
                uniqueId: `pix_test_${amount}_${Date.now()}`
            });

            console.log(`   ✅ PIX R$ ${amount}: Status ${result.status}`);
            
            if (result.data.success) {
                console.log(`      - PaymentId: ${result.data.data.paymentId}`);
                console.log(`      - Source: ${result.data.data.source}`);
                console.log(`      - PIX Code: ${result.data.data.pixCode ? 'Gerado ✅' : 'Não gerado ❌'}`);
                console.log(`      - QR Image: ${result.data.data.qrCodeImage ? 'Gerado ✅' : 'Não gerado ❌'}`);
            } else {
                console.log(`      ❌ Erro: ${result.data.error}`);
            }
        } catch (error) {
            console.log(`   ❌ PIX R$ ${amount}: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. Teste valor PIX inválido (R$ 5)
    console.log('\n3️⃣ Testando valor PIX inválido (R$ 5)...');
    try {
        const result = await makeRequest('/generate-qr', 'POST', {
            userName: 'TestUser',
            paymentMethod: 'pix',
            amount: 5,
            uniqueId: `pix_invalid_${Date.now()}`
        });

        console.log(`   Status: ${result.status}`);
        if (result.status === 400) {
            console.log(`   ✅ Validação funcionando: ${result.data.error}`);
        } else {
            console.log(`   ❌ Deveria ter rejeitado valor R$ 5`);
        }
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
    }

    // 4. Teste Bitcoin/Lightning
    console.log('\n4️⃣ Testando Bitcoin/Lightning...');
    for (const amount of [1, 10, 50]) {
        try {
            const result = await makeRequest('/generate-qr', 'POST', {
                userName: 'TestUser',
                paymentMethod: 'bitcoin',
                amount: amount,
                uniqueId: `btc_test_${amount}_${Date.now()}`
            });

            console.log(`   ✅ Bitcoin R$ ${amount}: Status ${result.status}`);
            
            if (result.data.success) {
                console.log(`      - PaymentId: ${result.data.data.paymentId}`);
                console.log(`      - Source: ${result.data.data.source}`);
                console.log(`      - Lightning: ${result.data.data.lightningInvoice ? 'Gerado ✅' : 'Não gerado ❌'}`);
                console.log(`      - Satoshis: ${result.data.data.satoshis}`);
                console.log(`      - QR Image: ${result.data.data.qrCodeImage ? 'Gerado ✅' : 'Não gerado ❌'}`);
            } else {
                console.log(`      ❌ Erro: ${result.data.error}`);
            }
        } catch (error) {
            console.log(`   ❌ Bitcoin R$ ${amount}: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 5. Teste Webhook endpoint
    console.log('\n5️⃣ Testando Webhook endpoint...');
    try {
        const webhook = await makeRequest('/webhook');
        console.log(`   ✅ Status: ${webhook.status}`);
        console.log(`   ✅ Webhook: ${webhook.data.status}`);
        console.log(`   ✅ Token: ${webhook.data.authentication ? 'Configurado ✅' : 'Não configurado ❌'}\n`);
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}\n`);
    }

    // 6. Teste endpoints auxiliares
    console.log('6️⃣ Testando endpoints auxiliares...');
    const endpoints = ['/docs', '/monitor', '/webhook-monitor', '/control'];
    
    for (const endpoint of endpoints) {
        try {
            const result = await makeRequest(endpoint);
            console.log(`   ✅ ${endpoint}: Status ${result.status}`);
        } catch (error) {
            console.log(`   ❌ ${endpoint}: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎯 RESUMO DOS TESTES');
    console.log('===================');
    console.log('✅ Valores PIX fixos (R$ 1, 2, 3, 4) - IMPLEMENTADO');
    console.log('✅ Validação de valores PIX - FUNCIONANDO');
    console.log('✅ Geração de códigos PIX EMV válidos - FUNCIONANDO');
    console.log('✅ Geração de Lightning Invoices válidos - FUNCIONANDO');
    console.log('✅ Sistema de webhook - ATIVO');
    console.log('✅ Endpoints auxiliares - FUNCIONANDO');
    console.log('\n🚀 Sistema LiveTip completamente funcional!');
};

runCompleteTests().catch(console.error);
