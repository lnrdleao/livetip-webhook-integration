// QR Code Generator com sistema de fallback para produção/serverless

// Inicializar variáveis para o módulo
let QRCodeWithLogo, qrCodeInstance;

// Tentar carregar o módulo que usa canvas
try {
    QRCodeWithLogo = require('./tests/unit/generators/qrCodeGenerator');
    qrCodeInstance = new QRCodeWithLogo();
    console.log('✅ QR Code Generator com canvas inicializado com sucesso');
} catch (error) {
    // Se falhar (normalmente em ambiente serverless), usar o fallback
    console.log('⚠️ Módulo canvas não disponível, usando fallback: ' + error.message);
    const fallbackModule = require('./qrCodeGeneratorFallback');
    QRCodeWithLogo = fallbackModule.QRCodeWithLogo;
    qrCodeInstance = fallbackModule.instance;
    console.log('✅ QR Code Generator fallback inicializado com sucesso');
}

// Esta é a forma mais robusta de exportação - manterá sempre a mesma instância
// Manter compatibilidade com códigos existentes
const qrModule = Object.assign(qrCodeInstance, {
    QRCodeWithLogo,                 // Exportar classe para compatibilidade
    instance: qrCodeInstance,       // Exportar instância explicitamente
    generateWithLogo: qrCodeInstance.generateWithLogo.bind(qrCodeInstance) // Exportar método diretamente
});

// Exportar módulo completo
module.exports = qrModule;
