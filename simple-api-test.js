// Script simples para testar a API do LiveTip
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testando a API LiveTip...');
    
    // 1. Health check
    console.log('\n1️⃣ Verificando saúde da API...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('Resposta:', healthData);
    
    // 2. Criando pagamento PIX
    console.log('\n2️⃣ Criando pagamento PIX...');
    const pixPayload = {
      userName: "Teste API JS",
      paymentMethod: "pix",
      amount: 10.5,
      email: "teste@api.js"
    };
    
    const pixResponse = await fetch('http://localhost:3001/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pixPayload)
    });
    
    const pixData = await pixResponse.json();
    console.log('Resposta do pagamento PIX:', pixData);
    
    // Se gerou um QR code, salvar em arquivo
    if (pixData.qrCodeImage) {
      console.log('✅ QR Code gerado com sucesso!');
    } else {
      console.log('❌ QR Code não foi gerado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  }
}

// Executar teste
testAPI().then(() => console.log('Teste concluído!'));
