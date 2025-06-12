// Teste final de verificação para a correção do QR code PIX e Bitcoin
// Execute este script para verificar se a correção foi bem sucedida

const axios = require('axios');
const fs = require('fs').promises;

// Configurações
const BASE_URL = 'http://localhost:3001';
const TEST_PIX_VALUES = [1, 2, 3, 4];
const TEST_BITCOIN_VALUES = [100, 200, 300, 400];

// Função para colorir o console
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Log com cores
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    let color = colors.reset;
    let prefix = '';
    
    switch (type.toLowerCase()) {
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
        case 'title':
            color = colors.cyan;
            prefix = '🔍 ';
            break;
        default:
            color = colors.reset;
    }
    
    console.log(`${color}${prefix}[${timestamp}] ${message}${colors.reset}`);
}

// Função principal
async function testPIXBitcoinFix() {
    log('INICIANDO TESTE DE CORREÇÃO PIX/BITCOIN QR CODE', 'title');
    log('-------------------------------------------------', 'title');
    
    try {
        // Testar PIX
        log('\nTESTE PIX', 'title');
        for (const value of TEST_PIX_VALUES) {
            log(`Testando PIX com valor R$ ${value}...`, 'info');
            const pixResponse = await axios.post(`${BASE_URL}/generate-qr`, {
                userName: `Teste PIX ${value}`,
                paymentMethod: 'pix',
                amount: value
            });
            
            if (pixResponse.data.success) {
                log(`✅ PIX R$ ${value} gerou resposta com sucesso`, 'success');
                
                const responseData = pixResponse.data.data;
                
                // Verificar QR code
                if (responseData.qrCodeImage) {
                    log(`QR Code URL: ${responseData.qrCodeImage.substring(0, 50)}...`, 'info');
                    
                    // Verificar formato URL
                    if (responseData.qrCodeImage.startsWith('http')) {
                        log('QR code em formato URL (compatível com produção)', 'success');
                    } else if (responseData.qrCodeImage.startsWith('data:image')) {
                        log('QR code em formato base64 (compatível com ambiente local)', 'success');
                    } else {
                        log('Formato de QR code desconhecido ou inválido', 'error');
                    }
                } else {
                    log('Resposta não contém QR code image', 'error');
                }
                
                // Verificar PIX code
                if (responseData.pixCode) {
                    log(`PIX Code encontrado (${responseData.pixCode.length} caracteres)`, 'success');
                } else {
                    log('PIX Code ausente na resposta', 'error');
                }
                
            } else {
                log(`Falha ao gerar QR code PIX R$ ${value}: ${pixResponse.data.error || 'Erro desconhecido'}`, 'error');
            }
            
            console.log(); // Linha em branco entre testes
        }
        
        // Testar Bitcoin
        log('\nTESTE BITCOIN', 'title');
        for (const value of TEST_BITCOIN_VALUES) {
            log(`Testando Bitcoin com valor ${value} satoshis...`, 'info');
            const btcResponse = await axios.post(`${BASE_URL}/generate-qr`, {
                userName: `Teste Bitcoin ${value}`,
                paymentMethod: 'bitcoin',
                amount: value,
                uniqueId: `TEST_BTC_${Date.now()}_${value}`
            });
            
            if (btcResponse.data.success) {
                log(`✅ Bitcoin ${value} satoshis gerou resposta com sucesso`, 'success');
                
                const responseData = btcResponse.data.data;
                
                // Verificar QR code
                if (responseData.qrCodeImage) {
                    log(`QR Code URL: ${responseData.qrCodeImage.substring(0, 50)}...`, 'info');
                    
                    // Verificar formato URL
                    if (responseData.qrCodeImage.startsWith('http')) {
                        log('QR code em formato URL (compatível com produção)', 'success');
                    } else if (responseData.qrCodeImage.startsWith('data:image')) {
                        log('QR code em formato base64 (compatível com ambiente local)', 'success');
                    } else {
                        log('Formato de QR code desconhecido ou inválido', 'error');
                    }
                } else {
                    log('Resposta não contém QR code image', 'error');
                }
                
                // Verificar Lightning/Bitcoin info
                const hasLightningOrBitcoin = responseData.lightningInvoice || responseData.bitcoinUri;
                if (hasLightningOrBitcoin) {
                    log('Lightning Invoice ou Bitcoin URI encontrado', 'success');
                } else {
                    log('Lightning Invoice e Bitcoin URI ausentes na resposta', 'error');
                }
                
            } else {
                log(`Falha ao gerar QR code Bitcoin ${value} satoshis: ${btcResponse.data.error || 'Erro desconhecido'}`, 'error');
            }
            
            console.log(); // Linha em branco entre testes
        }
        
        log('\nTESTE CONCLUÍDO!', 'title');
        
    } catch (error) {
        log(`Erro durante teste: ${error.message}`, 'error');
        if (error.response) {
            log(`Status: ${error.response.status}`, 'error');
            log(`Dados: ${JSON.stringify(error.response.data)}`, 'error');
        }
    }
}

// Executar teste
testPIXBitcoinFix();
