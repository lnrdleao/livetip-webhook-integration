// Teste de integração completa com a API do LiveTip e geração de QR codes
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Importar dependências
const QRCodeWithLogo = require('./qrCodeGenerator');
const LiveTipService = require('./liveTipService');
const config = require('./config');

// Função para salvar o QR code como arquivo
function saveQRCodeToFile(dataUrl, filename) {
    if (!dataUrl) {
        console.log('⚠️ QR Code não disponível para salvar');
        return null;
    }
    
    // Remover o prefixo do data URL para obter apenas os dados da imagem
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, filename);
    
    // Escrever os dados como arquivo
    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`✅ QR Code salvo em: ${filePath}`);
    return filePath;
}

async function testLiveTipIntegration() {
    console.log('🧪 Iniciando teste de integração do LiveTip...');
    
    try {
        // 1. Criar instância do serviço LiveTip
        console.log('\n1️⃣ Inicializando LiveTipService...');
        const liveTipService = new LiveTipService();
        
        // 2. Criar pagamento PIX via LiveTip
        console.log('\n2️⃣ Criando pagamento PIX via LiveTip...');
        const pixPaymentData = {
            userName: "Teste Integração",
            amount: 1.00,
            email: "teste@example.com",
            externalId: `test_pix_${Date.now()}`
        };
        
        try {
            console.log('💰 Enviando requisição para criar pagamento PIX...');
            const pixResponse = await liveTipService.createPixPayment(pixPaymentData);
            
            console.log('✅ Resposta recebida do LiveTip:');
            console.log('   🆔 Payment ID:', pixResponse.paymentId);
            console.log('   📝 PIX Code disponível:', pixResponse.pixCode ? '✅' : '❌');
            console.log('   🖼️ QR Code disponível:', pixResponse.qrCodeImage ? '✅' : '❌');
            
            // Salvar QR Code gerado
            if (pixResponse.qrCodeImage) {
                saveQRCodeToFile(pixResponse.qrCodeImage, 'test-pix-qrcode.png');
            }
            
            // Salvar código PIX para verificação
            if (pixResponse.pixCode) {
                fs.writeFileSync(path.join(__dirname, 'test-pix-code.txt'), pixResponse.pixCode);
                console.log('✅ Código PIX salvo em:', path.join(__dirname, 'test-pix-code.txt'));
            }
            
        } catch (pixError) {
            console.error('❌ Erro ao criar pagamento PIX:', pixError.message);
        }
        
        // 3. Criar pagamento Bitcoin via LiveTip
        console.log('\n3️⃣ Criando pagamento Bitcoin via LiveTip...');
        const btcPaymentData = {
            userName: "Teste BTC",
            amount: 1000, // 1000 satoshis
            email: "teste_btc@example.com",
            externalId: `test_btc_${Date.now()}`,
            uniqueId: `BTC_${Date.now()}_TEST`
        };
        
        try {
            console.log('💰 Enviando requisição para criar pagamento Bitcoin...');
            const btcResponse = await liveTipService.createBitcoinPayment(btcPaymentData);
            
            console.log('✅ Resposta recebida do LiveTip para Bitcoin:');
            console.log('   🆔 Payment ID:', btcResponse.paymentId);
            console.log('   ⚡ Lightning Invoice disponível:', btcResponse.lightningInvoice ? '✅' : '❌');
            console.log('   🖼️ QR Code disponível:', btcResponse.qrCodeImage ? '✅' : '❌');
            
            // Gerar QR Code manualmente se não estiver disponível
            if (!btcResponse.qrCodeImage && btcResponse.lightningInvoice) {
                console.log('🖼️ Gerando QR Code para Lightning Invoice...');
                const qrCodeGenerator = new QRCodeWithLogo();
                btcResponse.qrCodeImage = await qrCodeGenerator.generateWithLogo(btcResponse.lightningInvoice, 'bitcoin');
                console.log('✅ QR Code gerado localmente');
            }
            
            // Salvar QR Code
            if (btcResponse.qrCodeImage) {
                saveQRCodeToFile(btcResponse.qrCodeImage, 'test-btc-qrcode.png');
            }
            
            // Salvar Lightning Invoice para verificação
            if (btcResponse.lightningInvoice) {
                fs.writeFileSync(path.join(__dirname, 'test-btc-invoice.txt'), btcResponse.lightningInvoice);
                console.log('✅ Lightning Invoice salvo em:', path.join(__dirname, 'test-btc-invoice.txt'));
            }
            
        } catch (btcError) {
            console.error('❌ Erro ao criar pagamento Bitcoin:', btcError.message);
        }
        
        // 4. Testar endpoint da API diretamente
        console.log('\n4️⃣ Testando endpoint do servidor...');
        try {
            const testEndpointUrl = 'http://localhost:3001/generate-qr';
            console.log('🔗 Enviando requisição para:', testEndpointUrl);
            
            const endpointResponse = await fetch(testEndpointUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: "Teste API",
                    paymentMethod: "pix",
                    amount: 5.00
                })
            });
            
            const result = await endpointResponse.json();
            
            console.log('✅ Resposta do endpoint:', endpointResponse.status);
            console.log('   ✅ Success:', result.success);
            
            if (result.success) {
                console.log('   🆔 Payment ID:', result.data.paymentId);
                console.log('   🖼️ QR Code disponível:', result.data.qrCodeImage ? '✅' : '❌');
                
                // Salvar QR Code
                if (result.data.qrCodeImage) {
                    saveQRCodeToFile(result.data.qrCodeImage, 'test-api-qrcode.png');
                }
            } else {
                console.error('❌ Erro retornado pelo servidor:', result.error);
            }
            
        } catch (apiError) {
            console.error('❌ Erro ao testar endpoint da API:', apiError.message);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste de integração:', error);
        console.error('   Stack trace:', error.stack);
    }
    
    console.log('\n🏁 Teste de integração finalizado!');
}

// Executar o teste
testLiveTipIntegration().catch(console.error);
