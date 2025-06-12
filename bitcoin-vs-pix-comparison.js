// Teste específico para comparar Bitcoin vs PIX - encontrar diferenças
const fetch = require('node-fetch');

const LOCAL_URL = 'http://localhost:3001/generate-qr';
const PRODUCTION_URL = 'https://livetip-webhook-integration-8qpbvn4w5.vercel.app/generate-qr';

// Teste simples e direto
async function testPaymentMethod(url, method, environment) {
    console.log(`\n🔍 TESTE: ${method.toUpperCase()} - ${environment}`);
    console.log('='.repeat(50));
    
    const payload = method === 'pix' ? {
        userName: "TesteComparativo",
        paymentMethod: "pix",
        amount: 2
    } : {
        userName: "TesteComparativo", 
        paymentMethod: "bitcoin",
        amount: 1000,
        uniqueId: `BTC_${Date.now()}`
    };
    
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`📄 Resposta (primeiros 300 chars):\n${responseText.substring(0, 300)}...`);
        
        // Tentar parsear como JSON
        try {
            const data = JSON.parse(responseText);
            
            if (data.success) {
                console.log('✅ SUCESSO');
                console.log(`🆔 Payment ID: ${data.data?.paymentId || 'N/A'}`);
                console.log(`🖼️ QR Code: ${data.data?.qrCodeImage ? 'PRESENTE' : 'AUSENTE'}`);
                
                if (method === 'pix') {
                    console.log(`🏦 Código PIX: ${data.data?.pixCode ? 'PRESENTE' : 'AUSENTE'}`);
                } else {
                    console.log(`⚡ Lightning/URI: ${data.data?.lightningInvoice || data.data?.bitcoinUri ? 'PRESENTE' : 'AUSENTE'}`);
                }
                
                console.log(`📍 Source: ${data.data?.source || 'N/A'}`);
            } else {
                console.log('❌ ERRO:', data.error);
                console.log('📋 Detalhes:', data.details || 'N/A');
            }
        } catch (parseError) {
            console.log('❌ Erro ao parsear JSON:', parseError.message);
        }
        
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
    }
}

async function runComparison() {
    console.log('🔍 ANÁLISE COMPARATIVA: BITCOIN vs PIX');
    console.log('=====================================');
    
    // Testar Bitcoin (que funciona)
    await testPaymentMethod(LOCAL_URL, 'bitcoin', 'LOCAL');
    await testPaymentMethod(PRODUCTION_URL, 'bitcoin', 'PRODUÇÃO');
    
    // Testar PIX (que está falhando)
    await testPaymentMethod(LOCAL_URL, 'pix', 'LOCAL');
    await testPaymentMethod(PRODUCTION_URL, 'pix', 'PRODUÇÃO');
    
    console.log('\n✅ ANÁLISE CONCLUÍDA');
}

runComparison();
