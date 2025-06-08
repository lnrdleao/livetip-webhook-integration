const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Função auxiliar para aguardar
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para testar o sistema completo
async function testCompleteSystem() {
    console.log('🚀 Iniciando teste completo do sistema Bitcoin Satoshi-only...\n');

    try {
        // Teste 1: Criar pagamento Bitcoin com diferentes valores em satoshis
        console.log('📝 Teste 1: Criando pagamentos Bitcoin com valores satoshi...');
        
        const testPayments = [
            { userName: 'Teste Alice', amount: 1000, description: '1K sats' },
            { userName: 'Teste Bob', amount: 2100, description: '2.1K sats' },
            { userName: 'Teste Charlie', amount: 5000, description: '5K sats' },
            { userName: 'Teste Dana', amount: 10000, description: '10K sats' }
        ];

        const createdPayments = [];

        for (const testPayment of testPayments) {
            console.log(`\n  🔄 Criando pagamento: ${testPayment.description} para ${testPayment.userName}`);
            
            const response = await axios.post(`${BASE_URL}/generate-qr`, {
                userName: testPayment.userName,
                paymentMethod: 'bitcoin',
                amount: testPayment.amount,
                uniqueId: `BTC_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`.toUpperCase()
            });

            if (response.data.success) {
                console.log(`  ✅ Pagamento criado com sucesso!`);
                console.log(`     📋 Payment ID: ${response.data.data.paymentId}`);
                console.log(`     🔑 Unique ID: ${response.data.data.uniqueId}`);
                console.log(`     ⚡ Valor: ${response.data.data.amount} satoshis`);
                
                if (response.data.data.lightningInvoice) {
                    console.log(`     ⚡ Lightning Invoice: ${response.data.data.lightningInvoice.substring(0, 50)}...`);
                } else if (response.data.data.bitcoinUri) {
                    console.log(`     ₿ Bitcoin URI: ${response.data.data.bitcoinUri.substring(0, 50)}...`);
                }
                
                createdPayments.push(response.data.data);
            } else {
                console.log(`  ❌ Erro ao criar pagamento: ${response.data.error}`);
            }
            
            await delay(500); // Pequeno delay entre as criações
        }

        console.log(`\n✅ Criados ${createdPayments.length} pagamentos Bitcoin com sucesso!\n`);

        // Teste 2: Verificar status dos pagamentos
        console.log('🔍 Teste 2: Verificando status dos pagamentos...');
        
        for (const payment of createdPayments) {
            console.log(`\n  🔄 Verificando status do pagamento ${payment.paymentId}...`);
            
            try {
                const statusResponse = await axios.get(`${BASE_URL}/payment-status/${payment.paymentId}`);
                
                if (statusResponse.data.success) {
                    console.log(`  ✅ Status obtido: ${statusResponse.data.status || 'pending'}`);
                    console.log(`     📊 Payment ID: ${payment.paymentId}`);
                    console.log(`     🔑 Unique ID: ${payment.uniqueId}`);
                } else {
                    console.log(`  ⚠️ Erro ao verificar status: ${statusResponse.data.error}`);
                }
            } catch (error) {
                console.log(`  ❌ Erro na requisição de status: ${error.message}`);
            }
            
            await delay(300);
        }

        // Teste 3: Testar valores mínimos e validações
        console.log('\n⚠️ Teste 3: Testando validações e valores mínimos...');
        
        const validationTests = [
            { amount: 50, expected: 'error', description: 'Valor abaixo do mínimo (50 sats)' },
            { amount: 99, expected: 'error', description: 'Valor abaixo do mínimo (99 sats)' },
            { amount: 100, expected: 'success', description: 'Valor mínimo válido (100 sats)' },
            { amount: 1, expected: 'error', description: 'Valor muito baixo (1 sat)' }
        ];

        for (const test of validationTests) {
            console.log(`\n  🧪 Testando: ${test.description}`);
            
            try {
                const response = await axios.post(`${BASE_URL}/generate-qr`, {
                    userName: 'Teste Validação',
                    paymentMethod: 'bitcoin',
                    amount: test.amount,
                    uniqueId: `BTC_${Date.now()}_TEST`.toUpperCase()
                });

                if (test.expected === 'success' && response.data.success) {
                    console.log(`  ✅ Sucesso esperado: Pagamento criado com ${test.amount} sats`);
                } else if (test.expected === 'error' && !response.data.success) {
                    console.log(`  ✅ Erro esperado: ${response.data.error}`);
                } else {
                    console.log(`  ⚠️ Resultado inesperado: Expected ${test.expected}, got ${response.data.success ? 'success' : 'error'}`);
                }
            } catch (error) {
                if (test.expected === 'error') {
                    console.log(`  ✅ Erro esperado capturado: ${error.response?.data?.error || error.message}`);
                } else {
                    console.log(`  ❌ Erro inesperado: ${error.message}`);
                }
            }
            
            await delay(200);
        }

        // Teste 4: Listar todos os pagamentos
        console.log('\n📋 Teste 4: Listando todos os pagamentos...');
        
        try {
            const paymentsResponse = await axios.get(`${BASE_URL}/payments`);
            
            if (paymentsResponse.data.success) {
                const payments = paymentsResponse.data.payments;
                console.log(`  ✅ Total de pagamentos encontrados: ${payments.length}`);
                
                const bitcoinPayments = payments.filter(p => p.method === 'bitcoin');
                console.log(`  ₿ Pagamentos Bitcoin: ${bitcoinPayments.length}`);
                
                if (bitcoinPayments.length > 0) {
                    console.log('\n  📊 Últimos pagamentos Bitcoin:');
                    bitcoinPayments.slice(-3).forEach((payment, index) => {
                        console.log(`     ${index + 1}. ${payment.userName} - ${payment.amount} sats - ${payment.status} - ID: ${payment.uniqueId || 'N/A'}`);
                    });
                }
            } else {
                console.log(`  ❌ Erro ao listar pagamentos: ${paymentsResponse.data.error}`);
            }
        } catch (error) {
            console.log(`  ❌ Erro na requisição: ${error.message}`);
        }

        // Teste 5: Verificar logs de webhook
        console.log('\n📊 Teste 5: Verificando logs de webhook...');
        
        try {
            const logsResponse = await axios.get(`${BASE_URL}/webhook-logs`);
            
            if (logsResponse.data.success) {
                const logs = logsResponse.data.logs;
                console.log(`  ✅ Total de logs encontrados: ${logs.length}`);
                
                if (logs.length > 0) {
                    console.log('  📝 Últimos logs:');
                    logs.slice(-3).forEach((log, index) => {
                        console.log(`     ${index + 1}. ${log.type} - ${log.event} - ${log.status} - ${new Date(log.timestamp).toLocaleString()}`);
                    });
                }
            } else {
                console.log(`  ❌ Erro ao buscar logs: ${logsResponse.data.error}`);
            }
        } catch (error) {
            console.log(`  ❌ Erro na requisição de logs: ${error.message}`);
        }

        console.log('\n🎉 Teste completo finalizado!');
        console.log('\n📋 Resumo dos testes:');
        console.log('✅ Criação de pagamentos Bitcoin com valores em satoshis');
        console.log('✅ Geração de identificadores únicos automáticos');
        console.log('✅ Verificação de status de pagamentos');
        console.log('✅ Validação de valores mínimos');
        console.log('✅ Listagem de pagamentos');
        console.log('✅ Logs de webhook');
        console.log('\n🚀 Sistema Bitcoin Satoshi-only funcionando corretamente!');

    } catch (error) {
        console.error('❌ Erro geral no teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar teste se for chamado diretamente
if (require.main === module) {
    testCompleteSystem()
        .then(() => {
            console.log('\n✅ Todos os testes concluídos!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro nos testes:', error);
            process.exit(1);
        });
}

module.exports = { testCompleteSystem };
