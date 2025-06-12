const https = require('https');

console.log('🧪 TESTANDO APLICAÇÃO NA VERCEL');
console.log('='.repeat(50));

const baseUrl = 'https://livetip-webhook-integration.vercel.app';

const tests = [
    { name: 'Página Principal', path: '/', expected: 'LiveTip' },
    { name: 'Health Check', path: '/health', expected: 'OK' },
    { name: 'Webhook Status', path: '/webhook', expected: 'Webhook' },
    { name: 'CSS Stylesheet', path: '/style.css', expected: 'body' },
    { name: 'JavaScript', path: '/script.js', expected: 'function' }
];

function testEndpoint(url, name, expectedContent) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testando: ${name}`);
        console.log(`   URL: ${url}`);
        
        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`   ✅ Status: ${res.statusCode}`);
                    if (data.includes(expectedContent)) {
                        console.log(`   ✅ Conteúdo: Encontrado "${expectedContent}"`);
                        resolve(true);
                    } else {
                        console.log(`   ❌ Conteúdo: Não encontrado "${expectedContent}"`);
                        console.log(`   📄 Primeiros 100 chars: ${data.substring(0, 100)}...`);
                        resolve(false);
                    }
                } else {
                    console.log(`   ❌ Status: ${res.statusCode}`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`   ❌ Erro: ${error.message}`);
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            console.log('   ❌ Timeout');
            resolve(false);
        });
    });
}

async function runTests() {
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const url = baseUrl + test.path;
        const result = await testEndpoint(url, test.name, test.expected);
        
        if (result) {
            passed++;
        } else {
            failed++;
        }
        
        // Aguardar 1 segundo entre testes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO FINAL');
    console.log('='.repeat(50));
    console.log(`✅ Passou: ${passed}/${tests.length}`);
    console.log(`❌ Falhou: ${failed}/${tests.length}`);
    
    if (failed === 0) {
        console.log('\n🎉 DEPLOY VERCEL FUNCIONANDO PERFEITAMENTE!');
        console.log('✅ Todas as funcionalidades operacionais');
        console.log(`🔗 URL: ${baseUrl}`);
    } else {
        console.log('\n⚠️ Alguns testes falharam');
        console.log('🔧 Verificar logs da Vercel para mais detalhes');
    }
    
    console.log('\n🌐 URLs importantes:');
    console.log(`   🏠 Aplicação: ${baseUrl}`);
    console.log(`   💚 Health: ${baseUrl}/health`);
    console.log(`   🎯 Webhook: ${baseUrl}/webhook`);
    console.log(`   📊 Monitor: ${baseUrl}/webhook-monitor`);
}

runTests().catch(console.error);
