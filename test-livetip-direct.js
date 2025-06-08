// Teste direto da API LiveTip para Bitcoin
const fetch = require('node-fetch');

async function testLiveTipAPI() {
    console.log('🧪 === TESTE DIRETO DA API LIVETIP ===\n');
    
    try {
        const payload = {
            sender: "Leonardo Teste",
            content: `BTC_TEST_${Date.now()}`,
            currency: "BTC",
            amount: "0.000002" // 200 satoshis em BTC
        };
        
        console.log('📤 Enviando para API LiveTip:');
        console.log('URL:', 'https://api.livetip.gg/api/v1/message/10');
        console.log('Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch('https://api.livetip.gg/api/v1/message/10', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('\n📡 Resposta da API:');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                console.log('\n✅ Resposta JSON:', JSON.stringify(result, null, 2));
                
                if (result.code) {
                    console.log('\n⚡ Lightning Invoice encontrado:');
                    console.log('Código:', result.code.substring(0, 50) + '...');
                    console.log('ID:', result.id);
                } else {
                    console.log('\n❌ Lightning Invoice não encontrado na resposta');
                }
            } else {
                const text = await response.text();
                console.log('\n📄 Resposta Text:', text);
            }
        } else {
            const errorText = await response.text();
            console.log('\n❌ Erro da API:', errorText);
        }
        
    } catch (error) {
        console.error('\n💥 Erro na requisição:', error.message);
        console.error('Stack:', error.stack);
    }
}

testLiveTipAPI().then(() => {
    console.log('\n🏁 Teste da API LiveTip concluído');
    process.exit(0);
});
