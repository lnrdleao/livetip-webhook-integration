// Teste simples de conectividade
const https = require('https');

console.log('🧪 Testando Vercel Deploy...');

https.get('https://livetip-webhook-integration.vercel.app/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Resposta:', data.substring(0, 200));
        
        if (res.statusCode === 200 && data.includes('OK')) {
            console.log('✅ VERCEL DEPLOY FUNCIONANDO!');
        } else {
            console.log('❌ Problema no deploy');
        }
    });
}).on('error', (err) => {
    console.log('❌ Erro:', err.message);
});
