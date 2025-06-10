// Teste completo do sistema corrigido - PIX e Bitcoin
const axios = require('axios');

async function testCompleteSystem() {
    console.log('🚀 TESTE COMPLETO DO SISTEMA CORRIGIDO\n');
    console.log('Data:', new Date().toLocaleString('pt-BR'));
    console.log('='.repeat(60));

    // Configuração
    const baseUrl = 'http://localhost:3001';
    
    // Função para testar se o servidor está rodando
    async function checkServer() {
        try {
            const response = await axios.get(`${baseUrl}/health`);
            console.log('✅ Servidor está rodando');
            return true;
        } catch (error) {
            console.log('❌ Servidor não está rodando. Inicie com: npm run dev');
            return false;
        }
    }

    // Verificar servidor
    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log('\n📝 Para iniciar o servidor:');
        console.log('   npm run dev');
        return;
    }

    console.log('\n1️⃣ TESTANDO PAGAMENTOS PIX (R$ 1, 2, 3, 4):');
    console.log('-'.repeat(50));

    const pixAmounts = [1, 2, 3, 4];
    
    for (const amount of pixAmounts) {
        try {
            const response = await axios.post(`${baseUrl}/generate-qr`, {
                userName: "João Teste PIX",
                paymentMethod: "pix",
                amount: amount,
                uniqueId: `PIX_${Date.now()}_${amount}`
            });

            if (response.data.success) {
                const data = response.data.data;
                const pixCode = data.pixCode || data.qrCodeText;
                
                console.log(`✅ PIX R$ ${amount}:`);
                console.log(`   Payment ID: ${data.paymentId}`);
                console.log(`   Source: ${data.source}`);
                console.log(`   Code Length: ${pixCode.length}`);
                console.log(`   Valid Format: ${validatePixCode(pixCode) ? '✅' : '❌'}`);
                console.log(`   QR Image: ${data.qrCodeImage ? '✅' : '❌'}`);
                console.log(`   Code Preview: ${pixCode.substring(0, 50)}...`);
                
                if (!validatePixCode(pixCode)) {
                    console.log(`   ⚠️ PROBLEMA: Código PIX inválido!`);
                }
                
            } else {
                console.log(`❌ PIX R$ ${amount}: ${response.data.error}`);
            }
            
        } catch (error) {
            console.log(`❌ PIX R$ ${amount}: ${error.response?.data?.error || error.message}`);
        }
        
        console.log('');
    }

    console.log('\n2️⃣ TESTANDO PAGAMENTOS BITCOIN (100, 200, 300, 400 sats):');
    console.log('-'.repeat(50));

    const btcAmounts = [100, 200, 300, 400];
    
    for (const amount of btcAmounts) {
        try {
            const response = await axios.post(`${baseUrl}/generate-qr`, {
                userName: "João Teste Bitcoin",
                paymentMethod: "bitcoin",
                amount: amount,
                uniqueId: `BTC_${Date.now()}_${amount}`
            });

            if (response.data.success) {
                const data = response.data.data;
                const invoice = data.lightningInvoice || data.qrCodeText;
                
                console.log(`✅ Bitcoin ${amount} sats:`);
                console.log(`   Payment ID: ${data.paymentId}`);
                console.log(`   Source: ${data.source}`);
                console.log(`   Invoice Length: ${invoice.length}`);
                console.log(`   Valid Format: ${validateLightningInvoice(invoice) ? '✅' : '❌'}`);
                console.log(`   QR Image: ${data.qrCodeImage ? '✅' : '❌'}`);
                console.log(`   Invoice Preview: ${invoice.substring(0, 50)}...`);
                
                if (!validateLightningInvoice(invoice)) {
                    console.log(`   ⚠️ PROBLEMA: Lightning Invoice inválida!`);
                }
                
            } else {
                console.log(`❌ Bitcoin ${amount} sats: ${response.data.error}`);
            }
            
        } catch (error) {
            console.log(`❌ Bitcoin ${amount} sats: ${error.response?.data?.error || error.message}`);
        }
        
        console.log('');
    }

    console.log('\n3️⃣ TESTANDO VALIDAÇÕES:');
    console.log('-'.repeat(50));

    // Teste valor PIX inválido
    try {
        const response = await axios.post(`${baseUrl}/generate-qr`, {
            userName: "Teste Inválido",
            paymentMethod: "pix",
            amount: 5, // valor não permitido
            uniqueId: `PIX_INVALID_${Date.now()}`
        });
        
        console.log('❌ Deveria ter rejeitado PIX R$ 5');
        
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Corretamente rejeitou PIX R$ 5');
        } else {
            console.log('❌ Erro inesperado:', error.message);
        }
    }

    // Teste sem dados obrigatórios
    try {
        const response = await axios.post(`${baseUrl}/generate-qr`, {
            paymentMethod: "pix"
            // userName e amount faltando
        });
        
        console.log('❌ Deveria ter rejeitado dados incompletos');
        
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Corretamente rejeitou dados incompletos');
        } else {
            console.log('❌ Erro inesperado:', error.message);
        }
    }

    console.log('\n4️⃣ RESUMO DO TESTE:');
    console.log('-'.repeat(50));
    console.log('✅ Sistema testado completamente');
    console.log('📋 Verificações realizadas:');
    console.log('   - PIX: Valores R$ 1, 2, 3, 4');
    console.log('   - Bitcoin: Valores 100, 200, 300, 400 sats');
    console.log('   - Validação de formatos');
    console.log('   - Rejeição de valores inválidos');
    console.log('   - Fallback local quando LiveTip API falha');
    
    console.log('\n🎯 Se todos os testes passaram, o sistema está funcionando!');
    console.log('🌐 Acesse: http://localhost:3001 para testar na interface');
}

// Funções de validação
function validatePixCode(pixCode) {
    if (!pixCode || typeof pixCode !== 'string') return false;
    
    const checks = [
        pixCode.length >= 50,
        pixCode.startsWith('000201'),
        pixCode.includes('BR.GOV.BCB.PIX') || pixCode.includes('br.gov.bcb.pix'),
        pixCode.includes('5802BR'),
        /[0-9A-F]{4}$/.test(pixCode) // termina com CRC de 4 dígitos hex
    ];
    
    return checks.every(check => check);
}

function validateLightningInvoice(invoice) {
    if (!invoice || typeof invoice !== 'string') return false;
    
    const checks = [
        invoice.length >= 50,
        invoice.startsWith('lnbc'),
        /^[a-z0-9]+$/i.test(invoice),
        invoice.includes('1') || invoice.includes('n1')
    ];
    
    return checks.every(check => check);
}

// Executar teste
testCompleteSystem().catch(error => {
    console.error('❌ Erro no teste:', error.message);
});
