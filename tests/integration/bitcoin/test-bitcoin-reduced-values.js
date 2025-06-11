const axios = require('axios');

// Função para criar teste de pagamento Bitcoin
async function createBitcoinTest(amount, description) {
    try {
        console.log(`🚀 Testando pagamento Bitcoin - ${amount} sats`);
        console.log(`📝 ${description}`);
        
        // Gerar ID único para este teste
        const uniqueId = `BTC_${amount}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`🔑 ID Único: ${uniqueId}`);

        const payload = {
            userName: `Teste ${amount} Sats`,
            paymentMethod: "bitcoin",
            amount: amount,
            uniqueId: uniqueId // ID Único será enviado como mensagem para LiveTip
        };

        console.log('📋 Enviando payload...');

        const response = await axios.post('http://localhost:3001/create-payment', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success && response.data.paymentData.lightningInvoice) {
            console.log('✅ SUCESSO!');
            console.log(`💰 Valor: ${amount} satoshis`);
            console.log(`🔑 ID Único: ${uniqueId}`);
            console.log(`📱 Payment ID: ${response.data.paymentId}`);
            console.log(`⚡ Invoice: ${response.data.paymentData.lightningInvoice.substring(0, 60)}...`);
            return { success: true, amount, uniqueId, paymentId: response.data.paymentId };
        } else {
            console.log('❌ Falha na criação do pagamento');
            return { success: false, amount };
        }

    } catch (error) {
        console.error(`❌ Erro no teste ${amount} sats:`, error.response?.data || error.message);
        return { success: false, amount, error: error.message };
    }
}

// Função principal para executar todos os testes
async function runNewBitcoinTests() {
    console.log('🔄 Iniciando nova bateria de testes...');
    console.log('🎯 INICIANDO TESTES DE PAGAMENTOS BITCOIN - VALORES REDUZIDOS');
    console.log('=' .repeat(70));
    
    const amounts = [100, 210, 500, 1000];
    const descriptions = [
        "Teste básico reduzido (era 1,000 sats)",
        "Teste intermediário reduzido (era 2,100 sats)", 
        "Teste avançado reduzido (era 5,000 sats)",
        "Teste completo reduzido (era 10,000 sats)"
    ];
    
    const results = [];
    
    for (let i = 0; i < amounts.length; i++) {
        const result = await createBitcoinTest(amounts[i], descriptions[i]);
        results.push(result);
        
        // Aguardar 2 segundos entre cada teste
        if (i < amounts.length - 1) {
            console.log('⏱️  Aguardando 2 segundos...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Resumo dos resultados
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMO DOS TESTES - VALORES REDUZIDOS');
    console.log('='.repeat(70));
    
    let successful = 0;
    results.forEach(result => {
        if (result.success) {
            console.log(`✅ ${result.amount} sats - SUCESSO (ID: ${result.uniqueId})`);
            successful++;
        } else {
            console.log(`❌ ${result.amount} sats - FALHOU`);
        }
    });
    
    console.log('\n📈 ESTATÍSTICAS:');
    console.log(`✅ Sucessos: ${successful}/${results.length}`);
    console.log(`❌ Falhas: ${results.length - successful}/${results.length}`);
    console.log(`📊 Taxa de sucesso: ${((successful / results.length) * 100).toFixed(1)}%`);
    
    if (successful === results.length) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM!');
        console.log('🚀 Sistema pronto para pagamentos Bitcoin com valores reduzidos!');
    } else {
        console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima.');
    }
}

// Executar todos os testes
runNewBitcoinTests();
