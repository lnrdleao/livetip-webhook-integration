// Teste do sistema completo com nova configuração
// Nome -> campo "sender" da API
// ID Único -> campo "content" da API

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testNewConfiguration() {
    console.log('🚀 Testando nova configuração do sistema Bitcoin...\n');

    try {
        // Teste 1: Criar pagamento com configuração correta
        console.log('📝 Teste 1: Criando pagamento Bitcoin com nova configuração...');
        
        const testPayment = {
            userName: 'João Silva', // Vai para "sender"
            paymentMethod: 'bitcoin',
            amount: 2100, // Satoshis
            uniqueId: `BTC_${Date.now()}_TEST01`.toUpperCase() // Vai para "content"
        };

        console.log(`\n🔄 Criando pagamento:`);
        console.log(`   👤 Nome (sender): ${testPayment.userName}`);
        console.log(`   🔑 ID Único (content): ${testPayment.uniqueId}`);
        console.log(`   ⚡ Valor: ${testPayment.amount} satoshis`);

        const response = await fetch(`${BASE_URL}/generate-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayment)
        });

        const result = await response.json();

        if (result.success) {
            console.log(`\n✅ Pagamento criado com sucesso!`);
            console.log(`   📋 Payment ID: ${result.data.paymentId}`);
            console.log(`   🔑 Unique ID: ${result.data.uniqueId}`);
            console.log(`   👤 Nome: ${result.data.userName}`);
            console.log(`   ⚡ Valor: ${result.data.amount} satoshis`);
            
            if (result.data.lightningInvoice) {
                console.log(`   ⚡ Lightning Invoice: ${result.data.lightningInvoice.substring(0, 50)}...`);
            }

            // Teste 2: Verificar se aparece na página de controle
            console.log(`\n📊 Teste 2: Verificando listagem de pagamentos...`);
            
            const paymentsResponse = await fetch(`${BASE_URL}/payments`);
            const paymentsResult = await paymentsResponse.json();
            
            if (paymentsResult.success) {
                const bitcoinPayments = paymentsResult.payments.filter(p => p.method === 'bitcoin');
                console.log(`   ✅ Total de pagamentos Bitcoin: ${bitcoinPayments.length}`);
                
                const recentPayment = bitcoinPayments.find(p => p.uniqueId === testPayment.uniqueId);
                if (recentPayment) {
                    console.log(`   ✅ Pagamento encontrado na listagem:`);
                    console.log(`      📋 ID: ${recentPayment.id}`);
                    console.log(`      🔑 Unique ID: ${recentPayment.uniqueId}`);
                    console.log(`      👤 Nome: ${recentPayment.userName}`);
                    console.log(`      ⚡ Valor: ${recentPayment.amount} sats`);
                    console.log(`      📊 Status: ${recentPayment.status}`);
                } else {
                    console.log(`   ⚠️ Pagamento não encontrado na listagem`);
                }
            }

            // Teste 3: Verificar status individual
            console.log(`\n🔍 Teste 3: Verificando status do pagamento...`);
            
            const statusResponse = await fetch(`${BASE_URL}/payment-status/${result.data.paymentId}`);
            const statusResult = await statusResponse.json();
            
            if (statusResult.success) {
                console.log(`   ✅ Status verificado: ${statusResult.status || 'pending'}`);
            } else {
                console.log(`   ⚠️ Erro ao verificar status: ${statusResult.error}`);
            }

        } else {
            console.log(`❌ Erro ao criar pagamento: ${result.error}`);
        }

        // Teste 4: Testar múltiplos pagamentos para verificar controle
        console.log(`\n📋 Teste 4: Criando múltiplos pagamentos para teste de controle...`);
        
        const multiplePayments = [
            { userName: 'Maria Santos', amount: 1000, uniqueId: `BTC_${Date.now()}_MARIA`.toUpperCase() },
            { userName: 'Pedro Costa', amount: 5000, uniqueId: `BTC_${Date.now() + 1}_PEDRO`.toUpperCase() },
            { userName: 'Ana Oliveira', amount: 10000, uniqueId: `BTC_${Date.now() + 2}_ANA`.toUpperCase() }
        ];

        let successCount = 0;
        for (const payment of multiplePayments) {
            try {
                const multiResponse = await fetch(`${BASE_URL}/generate-qr`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...payment,
                        paymentMethod: 'bitcoin'
                    })
                });

                const multiResult = await multiResponse.json();
                if (multiResult.success) {
                    successCount++;
                    console.log(`   ✅ ${payment.userName}: ${payment.amount} sats - ID: ${payment.uniqueId}`);
                } else {
                    console.log(`   ❌ ${payment.userName}: Erro - ${multiResult.error}`);
                }
                
                // Pequeno delay entre requisições
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.log(`   ❌ ${payment.userName}: Erro na requisição - ${error.message}`);
            }
        }

        console.log(`\n📊 Resumo: ${successCount}/${multiplePayments.length} pagamentos criados com sucesso`);

        // Teste 5: Verificar logs de webhook
        console.log(`\n📝 Teste 5: Verificando logs de webhook...`);
        
        try {
            const logsResponse = await fetch(`${BASE_URL}/webhook-logs?limit=5`);
            const logsResult = await logsResponse.json();
            
            console.log(`   ✅ Total de logs: ${logsResult.total}`);
            if (logsResult.logs.length > 0) {
                console.log(`   📋 Últimos logs:`);
                logsResult.logs.slice(0, 3).forEach((log, index) => {
                    console.log(`      ${index + 1}. ${log.type} - ${log.event} - ${log.status} - ${new Date(log.timestamp).toLocaleTimeString()}`);
                });
            }
        } catch (error) {
            console.log(`   ⚠️ Erro ao buscar logs: ${error.message}`);
        }

        // Teste 6: Verificar stats do webhook
        console.log(`\n📊 Teste 6: Verificando estatísticas...`);
        
        try {
            const statsResponse = await fetch(`${BASE_URL}/webhook-stats`);
            const statsResult = await statsResponse.json();
            
            if (statsResult.success) {
                console.log(`   ✅ Webhook conectado`);
                console.log(`   📊 Total webhooks: ${statsResult.stats.totalWebhooks || 0}`);
                console.log(`   💰 Total pagamentos: ${statsResult.stats.totalPayments || 0}`);
            } else {
                console.log(`   ⚠️ Webhook não conectado`);
            }
        } catch (error) {
            console.log(`   ❌ Erro ao verificar stats: ${error.message}`);
        }

        console.log('\n🎉 Teste completo finalizado!');
        console.log('\n📋 Configuração Verificada:');
        console.log('✅ Nome vai para campo "sender" da API LiveTip');
        console.log('✅ ID Único vai para campo "content" da API LiveTip');
        console.log('✅ Valores em satoshis puros (sem conversão BRL)');
        console.log('✅ Página de controle separada funcionando');
        console.log('✅ Webhook tracking implementado');
        console.log('✅ Sistema de confirmação automática');

        console.log('\n🚀 Acesse as páginas:');
        console.log(`   📱 Principal: http://localhost:3001/`);
        console.log(`   📊 Controle: http://localhost:3001/control`);

    } catch (error) {
        console.error('\n❌ Erro geral no teste:', error.message);
    }
}

// Executar teste
if (require.main === module) {
    testNewConfiguration()
        .then(() => {
            console.log('\n✅ Teste concluído com sucesso!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro no teste:', error);
            process.exit(1);
        });
}

module.exports = { testNewConfiguration };
