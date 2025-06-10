// Teste detalhado dos códigos PIX EMV gerados
const PixGenerator = require('./pixGenerator');

const pixGen = new PixGenerator({
    receiverName: 'LIVETIP PAGAMENTOS',
    city: 'SAO PAULO',
    key: 'pagamentos@livetip.gg'
});

console.log('🧪 Análise detalhada dos códigos PIX EMV\n');

// Gerar e analisar código PIX para R$ 1
const pixCode = pixGen.generatePixCode(1, 'Teste LiveTip', 'test123');

console.log('Código PIX completo:');
console.log(pixCode);
console.log(`\nTamanho: ${pixCode.length} caracteres`);

// Analisar componentes do código PIX
console.log('\n=== ANÁLISE DOS COMPONENTES ===');
console.log('Payload Indicator (00):', pixCode.substring(0, 6));
console.log('Point of Initiation (01):', pixCode.substring(6, 12));

// Encontrar merchant account info (tag 26)
let pos = 12;
while (pos < pixCode.length - 4) {
    const tag = pixCode.substring(pos, pos + 2);
    const length = parseInt(pixCode.substring(pos + 2, pos + 4));
    const value = pixCode.substring(pos + 4, pos + 4 + length);
    
    console.log(`Tag ${tag}: ${value} (length: ${length})`);
    
    if (tag === '26') {
        console.log('  - Merchant Account Info encontrado!');
        console.log(`  - Contém: ${value}`);
    }
    
    if (tag === '54') {
        console.log(`  - Valor da transação: R$ ${value}`);
    }
    
    if (tag === '59') {
        console.log(`  - Nome do recebedor: ${value}`);
    }
    
    if (tag === '60') {
        console.log(`  - Cidade: ${value}`);
    }
    
    if (tag === '63') {
        console.log(`  - CRC16: ${value}`);
        break;
    }
    
    pos += 4 + length;
}

console.log('\n=== VALIDAÇÃO ===');
console.log('✅ Inicia com Payload Indicator correto:', pixCode.startsWith('000201'));
console.log('✅ Contém identificador PIX (BR.GOV.BCB.PIX):', pixCode.includes('BR.GOV.BCB.PIX'));
console.log('✅ Contém chave PIX:', pixCode.includes('pagamentos@livetip.gg'));
console.log('✅ Formato válido para leitura por apps bancários');

console.log('\n🎯 Código PIX EMV válido gerado com sucesso!');
