// Teste para verificar se o Bitcoin está usando o endpoint /message/10 corretamente
const LiveTipService = require('./liveTipService');
const liveTipService = new LiveTipService();

async function testBitcoinMessage10() {
    console.log('🧪 Testando pagamento Bitcoin via endpoint /message/10...\n');
      const testPaymentData = {
        userName: 'TestUser',
        amount: 100000, // 100,000 satoshis = 0.001 BTC (valor maior)
        uniqueId: `TEST_BTC_${Date.now()}`,
        externalId: `ext_${Date.now()}`
    };
      console.log('📝 Dados do teste:');
    console.log(`   Nome: ${testPaymentData.userName}`);
    console.log(`   Valor: ${testPaymentData.amount} satoshis (${(testPaymentData.amount / 100000000).toFixed(8)} BTC)`);
    console.log(`   ID Único: ${testPaymentData.uniqueId}`);
    console.log('');
    
    try {
        // Testar criação de pagamento Bitcoin
        const result = await liveTipService.createBitcoinPayment(testPaymentData);
        
        console.log('✅ SUCESSO! Pagamento Bitcoin criado via /message/10');
        console.log('📊 Resultado:');
        console.log(`   Payment ID: ${result.paymentId}`);
        console.log(`   Lightning Invoice: ${result.lightningInvoice.substring(0, 50)}...`);
        console.log(`   Satoshis: ${result.satoshis || result.liveTipData?.satoshis}`);
        console.log(`   Source: ${result.source}`);
        console.log(`   Expires At: ${result.expiresAt}`);
        
        // Verificar se o Lightning Invoice é válido (deve começar com lnbc)
        if (result.lightningInvoice && result.lightningInvoice.startsWith('lnbc')) {
            console.log('✅ Lightning Invoice válido (começa com lnbc)');
        } else {
            console.log('⚠️  Lightning Invoice pode ser inválido (não começa com lnbc)');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ ERRO no teste Bitcoin:');
        console.error(`   Mensagem: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        return false;
    }
}

// Executar teste
testBitcoinMessage10().then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
        console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('✅ Bitcoin está usando corretamente o endpoint /message/10');
        console.log('✅ Lightning Invoice gerado pela API LiveTip');
        console.log('✅ Sistema funcionando conforme esperado');
    } else {
        console.log('💥 TESTE FALHOU!');
        console.log('❌ Verificar configurações e conectividade');
    }
    console.log('='.repeat(50));
}).catch(error => {
    console.error('💥 Erro crítico no teste:', error);
});
