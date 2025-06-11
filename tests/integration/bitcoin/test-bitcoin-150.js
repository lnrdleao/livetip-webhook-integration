// Teste direto da API com valor R$ 150
const fetch = require('node-fetch');

async function testBitcoinAPI150() {
    console.log('🧪 Testando API Bitcoin com R$ 150...');
    
    // Gerar ID único para o teste
    const uniqueId = `BTC_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    
    try {
        const payload = {
            sender: "Test User",
            content: uniqueId, // Agora usa o ID Único ao invés da mensagem longa
            currency: "BTC", 
            amount: "150.00"
        };
        
        console.log('📤 Enviando payload:', JSON.stringify(payload, null, 2));
        console.log('🔑 ID Único gerado:', uniqueId);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch('https://api.livetip.gg/api/v1/message/10', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📊 Status:', response.status);
        console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.status === 201) {
            const result = await response.json();
            console.log('✅ Sucesso! Resposta:', JSON.stringify(result, null, 2));
            
            if (result.code) {
                console.log('⚡ Lightning Invoice válido!');
                console.log('🔍 Começa com:', result.code.substring(0, 10));
                console.log('📏 Tamanho:', result.code.length, 'caracteres');
            }
        } else {
            const errorText = await response.text();
            console.log('❌ Erro:', response.status, errorText);
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('⏰ Timeout após 15 segundos');
        } else {
            console.error('💥 Erro:', error.message);
        }
    }
    
    console.log('🏁 Teste finalizado');
    process.exit(0);
}

testBitcoinAPI150();
