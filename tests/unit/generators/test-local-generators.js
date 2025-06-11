// Teste dos geradores PIX e Lightning locais
const PixGenerator = require('./pixGenerator');
const LightningGenerator = require('./lightningGenerator');

console.log('🧪 TESTANDO GERADORES LOCAIS...\n');

// Teste 1: PIX Generator
console.log('1️⃣ TESTANDO PIX GENERATOR:');
try {
    const pixGen = new PixGenerator({
        receiverName: 'LIVETIP PAGAMENTOS',
        city: 'SAO PAULO',
        key: 'pagamentos@livetip.gg'
    });

    console.log('✅ PIX Generator criado');

    // Testar valores válidos
    const pixAmounts = [1, 2, 3, 4];
    
    for (const amount of pixAmounts) {
        try {
            const pixCode = pixGen.generatePixCode(
                amount,
                `Pagamento LiveTip R$ ${amount}`,
                `PIX_${Date.now()}_${amount}`
            );
            
            console.log(`✅ PIX R$ ${amount}:`);
            console.log(`   Length: ${pixCode.length}`);
            console.log(`   Starts with 00020126: ${pixCode.startsWith('00020126')}`);
            console.log(`   Contains PIX identifier: ${pixCode.includes('BR.GOV.BCB.PIX')}`);
            console.log(`   Full code: ${pixCode}`);
            console.log('');
            
        } catch (error) {
            console.error(`❌ PIX R$ ${amount} Error:`, error.message);
        }
    }

    // Testar valor inválido
    try {
        const invalidPixCode = pixGen.generatePixCode(5, 'Teste', 'test');
        console.log('❌ Should have failed for R$ 5');
    } catch (error) {
        console.log('✅ Correctly rejected R$ 5:', error.message);
    }

} catch (error) {
    console.error('❌ PIX Generator Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Teste 2: Lightning Generator
console.log('2️⃣ TESTANDO LIGHTNING GENERATOR:');
try {
    const lightningGen = new LightningGenerator();
    console.log('✅ Lightning Generator criado');

    // Testar valores Bitcoin em satoshis
    const btcAmounts = [100, 200, 300, 400];
    
    for (const amount of btcAmounts) {
        try {
            const invoiceData = lightningGen.generateInvoice(
                amount / 100000000, // satoshis para BTC
                `Pagamento LiveTip ${amount} sats`
            );
            
            console.log(`✅ Lightning ${amount} sats:`);
            console.log(`   Invoice length: ${invoiceData.invoice.length}`);
            console.log(`   Starts with lnbc: ${invoiceData.invoice.startsWith('lnbc')}`);
            console.log(`   Payment hash: ${invoiceData.paymentHash.substring(0, 16)}...`);
            console.log(`   Full invoice: ${invoiceData.invoice}`);
            console.log('');
            
        } catch (error) {
            console.error(`❌ Lightning ${amount} sats Error:`, error.message);
        }
    }

} catch (error) {
    console.error('❌ Lightning Generator Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Teste 3: Validação de formatos
console.log('3️⃣ TESTANDO VALIDAÇÃO DE FORMATOS:');

function validatePixFormat(pixCode) {
    const checks = {
        'Length > 50': pixCode.length > 50,
        'Starts with 000201': pixCode.startsWith('000201'),
        'Contains BR.GOV.BCB.PIX': pixCode.includes('BR.GOV.BCB.PIX'),
        'Ends with 4 char CRC': /[0-9A-F]{4}$/.test(pixCode.slice(-4)),
        'Contains amount': pixCode.includes('54'),
        'Contains merchant': pixCode.includes('59')
    };
    
    return checks;
}

function validateLightningFormat(invoice) {
    const checks = {
        'Length > 100': invoice.length > 100,
        'Starts with lnbc': invoice.startsWith('lnbc'),
        'Contains n1': invoice.includes('n1'),
        'Valid characters': /^[a-z0-9]+$/i.test(invoice),
        'Proper structure': /^lnbc\d*n1[a-z0-9]+$/i.test(invoice)
    };
    
    return checks;
}

// Testar um PIX
try {
    const pixGen = new PixGenerator({
        receiverName: 'LIVETIP PAGAMENTOS',
        city: 'SAO PAULO',
        key: 'pagamentos@livetip.gg'
    });
    
    const testPix = pixGen.generatePixCode(2, 'Teste validação', 'TEST_123');
    const pixValidation = validatePixFormat(testPix);
    
    console.log('📄 PIX Validation:');
    Object.entries(pixValidation).forEach(([check, result]) => {
        console.log(`   ${result ? '✅' : '❌'} ${check}`);
    });
    
} catch (error) {
    console.error('❌ PIX Validation Error:', error.message);
}

console.log('');

// Testar um Lightning
try {
    const lightningGen = new LightningGenerator();
    const testLightning = lightningGen.generateInvoice(0.000001, 'Teste validação');
    const lightningValidation = validateLightningFormat(testLightning.invoice);
    
    console.log('⚡ Lightning Validation:');
    Object.entries(lightningValidation).forEach(([check, result]) => {
        console.log(`   ${result ? '✅' : '❌'} ${check}`);
    });
    
} catch (error) {
    console.error('❌ Lightning Validation Error:', error.message);
}

console.log('\n🎯 Teste de geradores locais concluído!');
