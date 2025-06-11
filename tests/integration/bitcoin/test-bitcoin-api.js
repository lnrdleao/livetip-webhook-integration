// Teste da API LiveTip para Bitcoin
const fetch = require('node-fetch');

async function testBitcoinAPI() {
    console.log('🧪 Iniciando teste da API LiveTip para Bitcoin...');
    
    try {        const payload = {
            sender: "test_user",
            content: "Teste Bitcoin LiveTip - R$ 100.00",
            currency: "BTC", 
            amount: "100.00"
        };
        
        console.log('📤 Enviando payload:', JSON.stringify(payload, null, 2));
        
        // Adicionar timeout de 10 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
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
        
        const responseText = await response.text();
        console.log('📝 Resposta:', responseText);
        
        if (response.ok) {
            console.log('✅ Teste concluído com sucesso!');
        } else {
            console.log('❌ Erro na API:', response.status);
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('⏰ Timeout: API demorou mais de 10 segundos');
        } else {
            console.error('💥 Erro:', error.message);
        }
    }
    
    console.log('🏁 Teste finalizado');
    process.exit(0);
}

testBitcoinAPI();
