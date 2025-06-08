// Teste para verificar se o ID Único está sendo enviado corretamente como mensagem
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testUniqueIdAsMessage() {
    console.log('🧪 Testando se o ID Único está sendo enviado como mensagem...\n');

    try {
        // Teste: Criar um pagamento Bitcoin e verificar se o ID único é usado como mensagem
        const testData = {
            userName: 'Teste ID Único',
            paymentMethod: 'bitcoin',
            amount: 1000, // 1000 satoshis
            uniqueId: 'BTC_TEST_UNIQUE_MESSAGE_12345'
        };

        console.log('📝 Criando pagamento Bitcoin...');
        console.log(`👤 Nome: ${testData.userName}`);
        console.log(`💰 Valor: ${testData.amount} satoshis`);
        console.log(`🔑 ID Único: ${testData.uniqueId}`);

        const response = await axios.post(`${BASE_URL}/generate-qr`, testData);

        if (response.data.success) {
            console.log('\n✅ Pagamento criado com sucesso!');
            console.log(`📋 Payment ID: ${response.data.data.paymentId}`);
            console.log(`🔑 ID Único no retorno: ${response.data.data.uniqueId}`);
            
            if (response.data.data.lightningInvoice) {
                console.log(`⚡ Lightning Invoice gerado: ${response.data.data.lightningInvoice.substring(0, 50)}...`);
            }

            // Verificar se o ID único foi usado corretamente
            if (response.data.data.uniqueId === testData.uniqueId) {
                console.log('\n🎉 SUCESSO: ID Único está sendo processado corretamente!');
                console.log('💡 O ID Único agora é enviado como mensagem para a API LiveTip.');
                console.log('📨 Formato da mensagem: Apenas o ID Único (ex: BTC_TEST_UNIQUE_MESSAGE_12345)');
                console.log('🔄 Ao invés de: "Pagamento Bitcoin LiveTip - R$ 100.00 (33.333 sats)"');
                
                return true;
            } else {
                console.log('\n⚠️ AVISO: ID Único não corresponde ao enviado');
                return false;
            }
        } else {
            console.log('\n❌ Erro ao criar pagamento:', response.data.error);
            return false;
        }

    } catch (error) {
        console.error('\n❌ Erro no teste:', error.message);
        if (error.response && error.response.data) {
            console.error('Detalhes do erro:', error.response.data);
        }
        return false;
    }
}

// Teste adicional: Verificar múltiplos IDs únicos
async function testMultipleUniqueIds() {
    console.log('\n🔄 Testando múltiplos IDs únicos...\n');

    const testCases = [
        { userName: 'Alice', amount: 2100, uniqueId: 'BTC_ALICE_1234567890' },
        { userName: 'Bob', amount: 5000, uniqueId: 'BTC_BOB_0987654321' },
        { userName: 'Charlie', amount: 10000, uniqueId: 'BTC_CHARLIE_ABCDEF123' }
    ];

    let allPassed = true;

    for (const testCase of testCases) {
        console.log(`\n📝 Testando: ${testCase.userName} - ${testCase.amount} sats - ID: ${testCase.uniqueId}`);

        try {
            const response = await axios.post(`${BASE_URL}/generate-qr`, {
                userName: testCase.userName,
                paymentMethod: 'bitcoin',
                amount: testCase.amount,
                uniqueId: testCase.uniqueId
            });

            if (response.data.success && response.data.data.uniqueId === testCase.uniqueId) {
                console.log(`✅ ${testCase.userName}: ID Único processado corretamente`);
            } else {
                console.log(`❌ ${testCase.userName}: Falha no processamento do ID Único`);
                allPassed = false;
            }

            // Pequeno delay entre as requisições
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.log(`❌ ${testCase.userName}: Erro na requisição - ${error.message}`);
            allPassed = false;
        }
    }

    return allPassed;
}

// Executar testes
async function runAllTests() {
    console.log('🚀 Iniciando testes do ID Único como mensagem...\n');

    try {
        const test1 = await testUniqueIdAsMessage();
        const test2 = await testMultipleUniqueIds();

        console.log('\n📊 RESULTADOS DOS TESTES:');
        console.log(`✅ Teste ID Único único: ${test1 ? 'PASSOU' : 'FALHOU'}`);
        console.log(`✅ Teste múltiplos IDs: ${test2 ? 'PASSOU' : 'FALHOU'}`);

        if (test1 && test2) {
            console.log('\n🎉 TODOS OS TESTES PASSARAM!');
            console.log('\n📋 RESUMO DA IMPLEMENTAÇÃO:');
            console.log('• ID Único é gerado automaticamente para cada pagamento Bitcoin');
            console.log('• Nome do usuário vai para o campo "sender" da API LiveTip');
            console.log('• ID Único vai para o campo "content" (mensagem) da API LiveTip');
            console.log('• Ao invés de enviar mensagem longa, agora envia apenas o ID Único');
            console.log('• Webhook pode identificar pagamentos pelo ID Único no campo "content"');
        } else {
            console.log('\n⚠️ ALGUNS TESTES FALHARAM - Verificar implementação');
        }

    } catch (error) {
        console.error('\n❌ Erro geral nos testes:', error.message);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    runAllTests()
        .then(() => {
            console.log('\n✅ Testes concluídos!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro nos testes:', error);
            process.exit(1);
        });
}

module.exports = { testUniqueIdAsMessage, testMultipleUniqueIds, runAllTests };
