#!/usr/bin/env node

/**
 * 🧪 TESTE COMPLETO PÓS-DEPLOY VERCEL
 * Verifica se todas as funcionalidades estão operacionais em produção
 */

const https = require('https');
const http = require('http');

const VERCEL_URL = 'https://livetip-webhook-integration.vercel.app';
const LOCAL_URL = 'http://localhost:3001';

console.log('🧪 TESTE COMPLETO PÓS-DEPLOY VERCEL');
console.log('=' .repeat(60));

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https');
        const client = isHttps ? https : http;
        
        const req = client.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Testes para realizar
const tests = [
    {
        name: 'Página Principal',
        url: '/',
        expectedStatus: 200,
        expectedContent: 'LiveTip'
    },
    {
        name: 'Health Check',
        url: '/health',
        expectedStatus: 200,
        expectedContent: '"status":"OK"'
    },
    {
        name: 'Webhook Status',
        url: '/webhook',
        expectedStatus: 200,
        expectedContent: 'LiveTip Webhook Endpoint Ativo'
    },
    {
        name: 'CSS Stylesheet',
        url: '/style.css',
        expectedStatus: 200,
        expectedContent: 'body'
    },
    {
        name: 'JavaScript',
        url: '/script.js',
        expectedStatus: 200,
        expectedContent: 'function'
    },
    {
        name: 'Control Page',
        url: '/control',
        expectedStatus: 200,
        expectedContent: 'Controle de Pagamentos'
    },
    {
        name: 'Webhook Monitor',
        url: '/webhook-monitor',
        expectedStatus: 200,
        expectedContent: 'Monitor Webhook'
    }
];

async function runTests(baseUrl, environment) {
    console.log(`\n🌐 Testando ${environment}: ${baseUrl}`);
    console.log('-'.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const fullUrl = baseUrl + test.url;
            console.log(`\n🧪 ${test.name}`);
            console.log(`   URL: ${fullUrl}`);
            
            const response = await makeRequest(fullUrl);
            
            // Verificar status code
            if (response.statusCode === test.expectedStatus) {
                console.log(`   ✅ Status: ${response.statusCode}`);
            } else {
                console.log(`   ❌ Status: ${response.statusCode} (esperado: ${test.expectedStatus})`);
                failed++;
                continue;
            }
            
            // Verificar conteúdo
            if (test.expectedContent && response.data.includes(test.expectedContent)) {
                console.log(`   ✅ Conteúdo: Encontrado "${test.expectedContent}"`);
            } else if (test.expectedContent) {
                console.log(`   ❌ Conteúdo: Não encontrado "${test.expectedContent}"`);
                console.log(`   📄 Primeiros 200 chars: ${response.data.substring(0, 200)}...`);
                failed++;
                continue;
            }
            
            passed++;
            console.log(`   ✅ Teste passado!`);
            
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
            failed++;
        }
    }
    
    console.log(`\n📊 Resultado ${environment}:`);
    console.log(`   ✅ Passou: ${passed}/${tests.length}`);
    console.log(`   ❌ Falhou: ${failed}/${tests.length}`);
    
    return { passed, failed };
}

async function testWebhook(baseUrl) {
    console.log(`\n🎯 Testando Webhook: ${baseUrl}/webhook`);
    
    try {
        const webhookData = {
            type: 'payment.confirmed',
            data: {
                id: 'test-' + Date.now(),
                amount: 100,
                currency: 'BRL',
                method: 'bitcoin',
                status: 'confirmed'
            }
        };
        
        const response = await makeRequest(baseUrl + '/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livetip-Webhook-Secret-Token': '0ac7b9aa00e75e0215243f3bb177c844'
            },
            body: JSON.stringify(webhookData)
        });
        
        if (response.statusCode === 200) {
            console.log('   ✅ Webhook funcionando!');
            console.log(`   📄 Resposta: ${response.data.substring(0, 100)}...`);
        } else {
            console.log(`   ❌ Webhook falhou: Status ${response.statusCode}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Erro no webhook: ${error.message}`);
    }
}

async function runAllTests() {
    try {
        // Testar local primeiro
        const localResults = await runTests(LOCAL_URL, 'LOCAL');
        
        // Aguardar um pouco
        console.log('\n⏳ Aguardando 3 segundos...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Testar produção
        const prodResults = await runTests(VERCEL_URL, 'PRODUÇÃO');
        
        // Testar webhook em produção
        await testWebhook(VERCEL_URL);
        
        // Resumo final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO FINAL');
        console.log('='.repeat(60));
        console.log(`🏠 Local: ${localResults.passed}/${tests.length} passou`);
        console.log(`🌐 Produção: ${prodResults.passed}/${tests.length} passou`);
        
        if (prodResults.passed === tests.length) {
            console.log('\n🎉 DEPLOY VERCEL FUNCIONANDO PERFEITAMENTE!');
            console.log('✅ Todas as funcionalidades operacionais');
            console.log('🔗 URL: https://livetip-webhook-integration.vercel.app');
        } else {
            console.log('\n⚠️ Alguns testes falharam na produção');
            console.log('🔧 Verificar logs da Vercel para mais detalhes');
        }
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
    }
}

// Executar testes
runAllTests();
