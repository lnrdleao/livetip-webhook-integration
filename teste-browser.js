// TESTE SUPER SIMPLES - verificar PIX
fetch('https://livetip-webhook-integration.vercel.app/generate-qr', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        userName: 'Teste30Min',
        paymentMethod: 'pix', 
        amount: '5.00',
        uniqueId: 'teste_urgente_' + Date.now()
    })
})
.then(response => response.text())
.then(data => {
    console.log('RESPOSTA BRUTA:', data);
    try {
        const json = JSON.parse(data);
        console.log('✅ JSON VÁLIDO!');
        console.log('Fonte:', json.data?.source);
        console.log('Sucesso:', json.success);
    } catch (e) {
        console.log('❌ Ainda tem erro JSON:', e.message);
    }
})
.catch(error => {
    console.log('❌ Erro de rede:', error.message);
});
