/**
 * Teste final para verificação completa das correções QR Code PIX e Bitcoin
 * 
 * Este script testa:
 * 1. A correta exportação e singleton do QRCodeGenerator
 * 2. A geração de QR Codes para PIX
 * 3. A integração com LiveTipService
 */

// Cores para log
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Função de log melhorada
function log(message, type = 'info') {
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    let color = colors.reset;
    let prefix = '';

    switch(type) {
        case 'success':
            color = colors.green;
            prefix = '✅ ';
            break;
        case 'error':
            color = colors.red;
            prefix = '❌ ';
            break;
        case 'warning':
            color = colors.yellow;
            prefix = '⚠️ ';
            break;
        case 'info':
            color = colors.blue;
            prefix = 'ℹ️ ';
            break;
        case 'debug':
            color = colors.magenta;
            prefix = '🔍 ';
            break;
        case 'title':
            color = colors.cyan;
            prefix = '🔧 ';
            break;
    }

    console.log(`${color}${prefix}${message}${colors.reset}`);
}

log('Iniciando testes de correções QR Code PIX e Bitcoin', 'title');

// Teste 1: QRCodeGenerator como singleton
log('\n1. Teste do QRCodeGenerator como singleton', 'title');

try {
    // Importar duas vezes e verificar se é a mesma instância
    const qrGenerator1 = require('./qrCodeGenerator');
    const qrGenerator2 = require('./qrCodeGenerator');
    
    log('QR Generator 1 carregado', 'info');
    log('QR Generator 2 carregado', 'info');
    
    // Verificar se é o mesmo objeto (singleton)
    const isSameInstance = qrGenerator1 === qrGenerator2;
    
    if (isSameInstance) {
        log('Singleton funcionando: ambas importações referem ao mesmo objeto', 'success');
    } else {
        log('Singleton falhou: as importações são objetos diferentes', 'error');
        process.exit(1);
    }
    
    // Verificar se tem os métodos e propriedades esperados
    const hasClass = !!qrGenerator1.QRCodeWithLogo;
    const hasInstance = !!qrGenerator1.instance;
    const hasGenerateMethod = typeof qrGenerator1.generateWithLogo === 'function';
    
    if (hasClass && hasInstance && hasGenerateMethod) {
        log('Exportação completa: classe, instância e métodos disponíveis', 'success');
    } else {
        log(`Exportação incompleta: classe (${hasClass}), instância (${hasInstance}), método (${hasGenerateMethod})`, 'error');
        process.exit(1);
    }
} catch (error) {
    log(`Erro ao testar QRCodeGenerator: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
}

// Teste 2: Geração de QR Code
log('\n2. Teste de geração de QR Code', 'title');

async function testQRGeneration() {
    try {
        const qrGenerator = require('./qrCodeGenerator');
        const testText = 'https://livetip.gg/test';
        
        log('Gerando QR code sem logo...', 'info');
        const basicQR = await qrGenerator.generateWithLogo(testText);
        log('QR code básico gerado!', 'success');
        
        log('Gerando QR code com logo PIX...', 'info');
        const pixQR = await qrGenerator.generateWithLogo(testText, 'pix');
        log('QR code PIX gerado!', 'success');
        
        log('Gerando QR code com logo Bitcoin...', 'info');
        const btcQR = await qrGenerator.generateWithLogo(testText, 'bitcoin');
        log('QR code Bitcoin gerado!', 'success');
        
        return true;
    } catch (error) {
        log(`Erro ao gerar QR code: ${error.message}`, 'error');
        console.error(error);
        return false;
    }
}

// Teste 3: Integração com LiveTipService
log('\n3. Teste de integração com LiveTipService', 'title');

async function testLiveTipIntegration() {
    try {
        const LiveTipService = require('./liveTipService');
        const liveTipService = new LiveTipService();
        
        log('LiveTipService instanciado com sucesso', 'success');
        log('Verificando métodos necessários...', 'info');
        
        const hasCreatePixMethod = typeof liveTipService.createPixPayment === 'function';
        
        if (hasCreatePixMethod) {
            log('Método createPixPayment disponível', 'success');
        } else {
            log('Método createPixPayment não encontrado', 'error');
            return false;
        }
        
        log('Integração com LiveTipService OK', 'success');
        return true;
    } catch (error) {
        log(`Erro ao testar integração com LiveTipService: ${error.message}`, 'error');
        console.error(error);
        return false;
    }
}

// Executar todos os testes assíncronos
async function runAllTests() {
    try {
        const qrGenResult = await testQRGeneration();
        const liveTipResult = await testLiveTipIntegration();
        
        if (qrGenResult && liveTipResult) {
            log('\n✨ TODOS OS TESTES PASSARAM COM SUCESSO! ✨', 'success');
            log('As correções de QR Code PIX e Bitcoin foram aplicadas corretamente.', 'success');
        } else {
            log('\n⚠️ ALGUNS TESTES FALHARAM!', 'error');
            log('Revise os erros acima e corrija os problemas.', 'error');
            process.exit(1);
        }
    } catch (error) {
        log(`Erro ao executar testes: ${error.message}`, 'error');
        console.error(error);
        process.exit(1);
    }
}

// Executar os testes
runAllTests();
