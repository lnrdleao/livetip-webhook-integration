// Teste de geração de QR Code para PIX
require('dotenv').config();
const QRCodeWithLogo = require('./qrCodeGenerator');
const LiveTipService = require('./liveTipService');
const fs = require('fs');
const path = require('path');

// Função para salvar um data URL como arquivo de imagem
function saveDataUrlAsImage(dataUrl, filePath) {
    // Remover o prefixo do data URL para obter apenas os dados da imagem
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    
    // Escrever os dados como arquivo
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    console.log(`✅ Imagem salva em: ${filePath}`);
}

async function testQRCodeGeneration() {
    try {
        console.log('🧪 Iniciando teste de geração de QR Code...');
        
        // 1. Teste com QRCodeWithLogo direto
        console.log('1️⃣ Teste com QRCodeWithLogo diretamente');
        const qrCodeGenerator = new QRCodeWithLogo();
        
        // Gerar um código PIX de exemplo
        const pixCodeExample = "00020101021226870014br.gov.bcb.pix2565qrcodepix@sejaefi.com.br5204000053039865802BR5925LIVETIP PAGAMENTOS LTDA6014BELO HORIZONTE62290525SEJAEFI202506111234567890123456304E08E";
        
        // Gerar QR code
        console.log('🖼️ Gerando QR Code para PIX de exemplo...');
        const qrCodeDataUrl = await qrCodeGenerator.generateWithLogo(pixCodeExample, 'pix');
        
        // Salvar QR Code em um arquivo
        const outputPath = path.join(__dirname, 'test-qr-output.png');
        saveDataUrlAsImage(qrCodeDataUrl, outputPath);
        
        // 2. Teste com LiveTipService
        console.log('\n2️⃣ Teste com LiveTipService');
        const liveTipService = new LiveTipService();
        
        // Dados de exemplo para pagamento PIX
        const paymentData = {
            userName: "Teste QR Code",
            amount: 1.00,
            email: "teste@example.com",
            externalId: `test_${Date.now()}`
        };
        
        try {
            // Tentar criar pagamento PIX via LiveTip
            console.log('💰 Criando pagamento PIX via LiveTip API...');
            const liveTipResponse = await liveTipService.createPixPayment(paymentData);
            
            // Verificar se o QR Code foi gerado
            if (liveTipResponse.qrCodeImage) {
                console.log('✅ QR Code gerado com sucesso na LiveTipService');
                const outputPathLiveTip = path.join(__dirname, 'test-qr-livetip.png');
                saveDataUrlAsImage(liveTipResponse.qrCodeImage, outputPathLiveTip);
            } else {
                console.log('❌ LiveTipService não gerou QR Code');
            }
            
            // Mostrar o código PIX
            console.log('\n📝 Código PIX recebido:');
            console.log(liveTipResponse.pixCode);
            
        } catch (error) {
            console.error('❌ Erro ao criar pagamento via LiveTip:', error);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar teste
testQRCodeGeneration().then(() => {
    console.log('\n🏁 Teste finalizado!');
});
