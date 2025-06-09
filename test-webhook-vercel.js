#!/usr/bin/env node

/**
 * 🎯 TESTE WEBHOOK VERCEL
 * Testa se o endpoint webhook está funcionando na produção
 */

const https = require('https');

const WEBHOOK_URL = 'https://livetip-webhook-integration.vercel.app/webhook';
const WEBHOOK_TOKEN = '0ac7b9aa00e75e0215243f3bb177c844';

console.log('🎯 TESTANDO WEBHOOK NA VERCEL');
console.log('='.repeat(40));
console.log(`URL: ${WEBHOOK_URL}`);

// Teste GET (status do webhook)
function testWebhookStatus() {
    return new Promise((resolve) => {
        console.log('\n📊 Testando status do webhook (GET)...');
        
        https.get(WEBHOOK_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Webhook endpoint ativo');
                    console.log(`📄 Status: ${res.statusCode}`);
                    try {
                        const json = JSON.parse(data);
                        console.log(`📊 Total webhooks recebidos: ${json.totalWebhooks || 0}`);
                        console.log(`💰 Total pagamentos: ${json.totalPayments || 0}`);
                        resolve(true);
                    } catch (e) {
                        console.log('⚠️ Resposta não é JSON válido');
                        console.log(`📄 Resposta: ${data.substring(0, 200)}...`);
                        resolve(false);
                    }
                } else {
                    console.log(`❌ Status: ${res.statusCode}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log(`❌ Erro: ${err.message}`);
            resolve(false);
        });
    });
}

// Teste POST (envio de webhook)
function testWebhookPost() {
    return new Promise((resolve) => {
        console.log('\n🚀 Testando envio de webhook (POST)...');
        
        const testData = {
            type: 'payment.confirmed',
            event: 'test_webhook_vercel',
            data: {
                id: 'test_' + Date.now(),
                amount: 50.00,
                currency: 'BRL',
                method: 'bitcoin',
                status: 'confirmed',
                timestamp: new Date().toISOString(),
                user: 'teste_vercel'
            }
        };
        
        const postData = JSON.stringify(testData);
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'X-Livetip-Webhook-Secret-Token': WEBHOOK_TOKEN
            }
        };
        
        const req = https.request(WEBHOOK_URL, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Webhook POST funcionando');
                    console.log(`📄 Status: ${res.statusCode}`);
                    console.log(`📊 Resposta: ${data.substring(0, 100)}...`);
                    resolve(true);
                } else {
                    console.log(`❌ Status: ${res.statusCode}`);
                    console.log(`📄 Resposta: ${data}`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ Erro: ${err.message}`);
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}

async function runWebhookTests() {
    console.log('🧪 Iniciando testes do webhook...\n');
    
    const statusTest = await testWebhookStatus();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const postTest = await testWebhookPost();
    
    console.log('\n' + '='.repeat(40));
    console.log('📊 RESULTADO WEBHOOK TESTS');
    console.log('='.repeat(40));
    console.log(`📊 Status Test: ${statusTest ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`🚀 POST Test: ${postTest ? '✅ PASSOU' : '❌ FALHOU'}`);
    
    if (statusTest && postTest) {
        console.log('\n🎉 WEBHOOK FUNCIONANDO PERFEITAMENTE!');
        console.log('✅ Endpoint ativo e recebendo dados corretamente');
        console.log('🔗 Pronto para integração com LiveTip');
    } else {
        console.log('\n⚠️ Problemas detectados no webhook');
        console.log('🔧 Verificar configuração e logs');
    }
    
    console.log('\n🌐 URLs para monitoramento:');
    console.log(`   🎯 Webhook: ${WEBHOOK_URL}`);
    console.log(`   📊 Monitor: https://livetip-webhook-integration.vercel.app/webhook-monitor`);
}

runWebhookTests().catch(console.error);
