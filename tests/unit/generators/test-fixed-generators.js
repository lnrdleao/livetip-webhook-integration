// Teste dos geradores corrigidos
const PixGeneratorFixed = require('./pixGeneratorFixed');
const LightningGeneratorFixed = require('./lightningGeneratorFixed');

console.log('🔧 TESTANDO GERADORES CORRIGIDOS...\n');

// Teste PIX
console.log('1️⃣ TESTANDO PIX CORRIGIDO:');
try {
    const pixGen = new PixGeneratorFixed({
        receiverName: 'LIVETIP PAGAMENTOS',
        city: 'SAO PAULO',
        key: 'pagamentos@livetip.gg'
    });

    const pixAmounts = [1, 2, 3, 4];
    
    for (const amount of pixAmounts) {
        const pixCode = pixGen.generatePixCode(
            amount,
            `Pagamento LiveTip R$ ${amount}`,
            `PIX_${Date.now()}_${amount}`
        );
        
        const isValid = pixGen.validateGeneratedPix(pixCode);
        
        console.log(`${isValid ? '✅' : '❌'} PIX R$ ${amount}:`);
        console.log(`   Length: ${pixCode.length}`);
        console.log(`   Valid: ${isValid}`);
        console.log(`   Code: ${pixCode.substring(0, 100)}...`);
        console.log('');
    }
} catch (error) {
    console.error('❌ PIX Error:', error.message);
}

console.log('='.repeat(50) + '\n');

// Teste Lightning
console.log('2️⃣ TESTANDO LIGHTNING CORRIGIDO:');
try {
    const lightningGen = new LightningGeneratorFixed();

    const btcAmounts = [100, 200, 300, 400];
    
    for (const amount of btcAmounts) {
        const invoiceData = lightningGen.generateValidInvoice(
            amount,
            `Pagamento LiveTip ${amount} sats`
        );
        
        const isValid = lightningGen.validateGeneratedInvoice(invoiceData.invoice);
        
        console.log(`${isValid ? '✅' : '❌'} Lightning ${amount} sats:`);
        console.log(`   Length: ${invoiceData.invoice.length}`);
        console.log(`   Valid: ${isValid}`);
        console.log(`   Invoice: ${invoiceData.invoice.substring(0, 100)}...`);
        console.log('');
    }
} catch (error) {
    console.error('❌ Lightning Error:', error.message);
}

console.log('='.repeat(50) + '\n');

// Teste de comparação com exemplos reais
console.log('3️⃣ COMPARAÇÃO COM FORMATOS REAIS:');

// PIX real de exemplo
const realPix = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000052040000530398654041.005802BR5925JOAO DA SILVA SAURO6009SAO PAULO62070503***63041234";

// Lightning real de exemplo  
const realLightning = "lnbc2500u1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpuaxtfvs6u2a9gdgf2k8x3n4wkqz74lyzv0z74pjhxsq9h7lspqgv6j7qcf2j8sq8tllm3gcwm5h6ldthqwm2ckxs2ghdqjlckt4hdmx87j6ypqs8xsxw";

console.log('📄 PIX Real:');
console.log(`   Length: ${realPix.length}`);
console.log(`   Starts: ${realPix.substring(0, 20)}`);
console.log(`   Format: 000201...`);

console.log('\n⚡ Lightning Real:');
console.log(`   Length: ${realLightning.length}`);
console.log(`   Starts: ${realLightning.substring(0, 20)}`);
console.log(`   Format: lnbc[amount]...`);

console.log('\n🎯 Agora testando nossos geradores com esses padrões...');

try {
    const pixGen = new PixGeneratorFixed();
    const testPix = pixGen.generatePixCode(2, 'Teste', 'TEST123');
    
    console.log('\n📄 NOSSO PIX:');
    console.log(`   Length: ${testPix.length} (real: ${realPix.length})`);
    console.log(`   Starts: ${testPix.substring(0, 20)} (real: ${realPix.substring(0, 20)})`);
    console.log(`   Match format: ${testPix.startsWith('000201') ? '✅' : '❌'}`);
    
} catch (error) {
    console.error('❌ Erro PIX:', error.message);
}

try {
    const lightningGen = new LightningGeneratorFixed();
    const testLightning = lightningGen.generateValidInvoice(200, 'Teste');
    
    console.log('\n⚡ NOSSA LIGHTNING:');
    console.log(`   Length: ${testLightning.invoice.length} (real: ${realLightning.length})`);
    console.log(`   Starts: ${testLightning.invoice.substring(0, 20)} (real: ${realLightning.substring(0, 20)})`);
    console.log(`   Match format: ${testLightning.invoice.startsWith('lnbc') ? '✅' : '❌'}`);
    
} catch (error) {
    console.error('❌ Erro Lightning:', error.message);
}

console.log('\n🎯 Teste concluído!');
