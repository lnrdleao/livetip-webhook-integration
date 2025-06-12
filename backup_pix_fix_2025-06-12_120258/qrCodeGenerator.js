// QR Code Generator with Logo - Wrapper para o gerador real
const QRCodeWithLogo = require('./tests/unit/generators/qrCodeGenerator');

// Criar uma única instância global
const qrCodeInstance = new QRCodeWithLogo();

// Esta é a forma mais robusta de exportação - manterá sempre a mesma instância
// Manter compatibilidade com códigos existentes
const qrModule = Object.assign(qrCodeInstance, {
    QRCodeWithLogo,                 // Exportar classe para compatibilidade
    instance: qrCodeInstance,       // Exportar instância explicitamente
    generateWithLogo: qrCodeInstance.generateWithLogo.bind(qrCodeInstance) // Exportar método diretamente
});

// Exportar módulo completo
module.exports = qrModule;
