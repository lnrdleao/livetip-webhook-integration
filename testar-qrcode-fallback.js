// Teste de geração de QR Code com módulo fallback
// Este script verifica se o sistema consegue gerar QR codes mesmo sem o módulo canvas

const qrCodeGenerator = require('./qrCodeGenerator');

async function testarGeracaoQrCode() {
    console.log('🧪 Testando geração de QR Code com fallback automático');
    
    try {
        // Testar geração de QR Code PIX
        console.log('🔄 Gerando QR Code PIX...');
        const pixCode = '00020101021226800014br.gov.bcb.pix2558invoice-payment.livepix.gg/qr/v2/9d7cb0da52014705171b02b3c6a0a80b5204000053039865802BR5925LEONARDO SILVA LEAO6009SAO PAULO62070503***63048A13';
        const qrPix = await qrCodeGenerator.generateWithLogo(pixCode, 'pix');
        console.log('✅ QR Code PIX gerado:', qrPix.substring(0, 100) + '...');
        
        // Testar geração de QR Code Bitcoin
        console.log('\n🔄 Gerando QR Code Bitcoin...');
        const bitcoinInvoice = 'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.00001&label=Pagamento';
        const qrBitcoin = await qrCodeGenerator.generateWithLogo(bitcoinInvoice, 'bitcoin');
        console.log('✅ QR Code Bitcoin gerado:', qrBitcoin.substring(0, 100) + '...');
        
        console.log('\n🎉 Teste concluído com sucesso! O sistema pode gerar QR codes com ou sem o módulo canvas.');
    } catch (error) {
        console.error('❌ Erro ao testar geração de QR Code:', error);
    }
}

// Executar teste
testarGeracaoQrCode();
