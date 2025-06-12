// Correção específica para o PIX baseada no código que funciona no Bitcoin
// Este script deve resolver o problema do QR code PIX em produção

/**
 * Adaptação do tratamento do Bitcoin para o PIX
 * O principal problema é que o objeto paymentData está com estrutura diferente
 * entre o Bitcoin e o PIX no ambiente de produção.
 */

// QR code generator simplificado que funciona em ambos os ambientes
function createExternalQrCode(text) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
}

// Função para unificar o tratamento PIX e Bitcoin
function unifyPaymentData(paymentData, isProductionEnv = true) {
    // Se já está no formato esperado, não faz nada
    if (paymentData.qrCodeImage && typeof paymentData.qrCodeImage === 'string' &&
        (paymentData.qrCodeImage.startsWith('http') || paymentData.qrCodeImage.startsWith('data:image'))) {
        console.log('✅ QR code URL já está no formato correto');
        return paymentData;
    }

    console.log('⚠️ QR code ausente ou em formato inválido, aplicando correção...');
    
    // Determinar o código base a usar para o QR Code
    let qrCodeText = '';
    
    if (paymentData.method === 'pix' && paymentData.pixCode) {
        qrCodeText = paymentData.pixCode;
        console.log('📝 Usando código PIX para gerar QR code');
    } else if (paymentData.method === 'bitcoin') {
        qrCodeText = paymentData.lightningInvoice || paymentData.bitcoinUri || '';
        console.log('⚡ Usando Lightning/Bitcoin URI para gerar QR code');
    } else {
        qrCodeText = `Payment ID: ${paymentData.id}`;
        console.log('🆔 Usando ID do pagamento como fallback');
    }
    
    // Gerar URL externa para o QR code
    paymentData.qrCodeImage = createExternalQrCode(qrCodeText);
    console.log('🔄 QR code URL gerada:', paymentData.qrCodeImage);
    
    // Garantir consistência do objeto
    if (paymentData.method === 'pix') {
        if (!paymentData.source) paymentData.source = 'livetip'; // Mesmo formato do Bitcoin
    }
    
    return paymentData;
}

// Função principal para usar no frontend e sanitizar a resposta
function ensureQRCodeData(responseData, paymentMethod) {
    if (!responseData) return null;
    
    // Padronizar o formato de dados, independente do ambiente
    responseData.method = paymentMethod || responseData.method || 'unknown';
    
    // Unificar estrutura de dados entre PIX e Bitcoin
    return unifyPaymentData(responseData);
}

module.exports = {
    createExternalQrCode,
    unifyPaymentData,
    ensureQRCodeData
};
