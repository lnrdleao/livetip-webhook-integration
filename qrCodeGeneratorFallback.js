// QR Code Generator Fallback usando APIs externas para produção
// Este módulo é utilizado quando o canvas não está disponível

/**
 * Classe para geração de QR codes utilizando API externa
 * em ambientes que não têm suporte a canvas (serverless, etc)
 */
class QRCodeGeneratorFallback {
    constructor() {
        this.apiUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    }

    /**
     * Gera QR code com usando API externa
     * @param {string} text - Texto do QR code
     * @param {string} logoType - Tipo do logo ('bitcoin', 'pix', ou 'custom')
     * @param {object} options - Opções customizadas
     */
    async generateWithLogo(text, logoType = null, options = {}) {
        try {
            // Usa a API do QR Server para gerar o QR code
            const qrCodeUrl = `${this.apiUrl}?size=300x300&data=${encodeURIComponent(text)}`;
            console.log(`🔄 Gerando QR code via API externa: ${qrCodeUrl.substring(0, 100)}...`);
            
            return qrCodeUrl;
        } catch (error) {
            console.error('❌ Erro ao gerar QR code via API externa:', error);
            // Fallback do fallback: retorna URL direta
            return `${this.apiUrl}?size=300x300&data=${encodeURIComponent(text)}`;
        }
    }
}

// Exportar uma única instância
const qrCodeInstance = new QRCodeGeneratorFallback();

// Manter compatibilidade com o módulo original
const qrModule = Object.assign(qrCodeInstance, {
    QRCodeWithLogo: QRCodeGeneratorFallback,        
    instance: qrCodeInstance,                       
    generateWithLogo: qrCodeInstance.generateWithLogo.bind(qrCodeInstance)
});

module.exports = qrModule;
