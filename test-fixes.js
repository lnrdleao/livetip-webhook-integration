// Teste para verificar se as correções funcionam

// 1. Teste do QRCodeGenerator
console.log('1. Testando QRCodeGenerator...');
const qrModule = require('./qrCodeGenerator');
console.log('- Módulo QRCodeGenerator carregado:', !!qrModule);
console.log('- QRCodeWithLogo class disponível:', !!qrModule.QRCodeWithLogo);
console.log('- Instance disponível:', !!qrModule.instance);
console.log('- Instance é do tipo QRCodeWithLogo:', qrModule.instance instanceof qrModule.QRCodeWithLogo);
console.log('- generateWithLogo function disponível:', typeof qrModule.instance.generateWithLogo === 'function');

// 2. Teste do LiveTipService e QR Code
const LiveTipService = require('./liveTipService');
console.log('\n2. Testando LiveTipService...');
console.log('- LiveTipService carregado:', !!LiveTipService);

// Verificar se não há erros na inicialização
try {
  const service = new LiveTipService();
  console.log('- LiveTipService instanciado com sucesso');
} catch (error) {
  console.error('- ERRO ao instanciar LiveTipService:', error.message);
}

console.log('\nTeste concluído - Verifique se não houve erros acima!');
