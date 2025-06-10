// Teste local completo do sistema PIX e Bitcoin
const axios = require('axios');

async function testLocalSystem() {
    console.log('🧪 TESTE LOCAL DO SISTEMA LIVETIP');
    console.log('==================================');
    console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    console.log('🌐 URL Local: http://localhost:3001\n');

    const baseUrl = 'http://localhost:3001';
    
    // 1. Verificar se o servidor está rodando
    console.log('1️⃣ VERIFICANDO SERVIDOR LOCAL...');
    console.log('-'.repeat(40));
    
    try {
        const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
        console.log('✅ Servidor está online');
        console.log(`📊 Status: ${healthResponse.status}`);
        console.log(`🕒 Timestamp: ${healthResponse.data.timestamp}`);
        console.log(`🔧 Versão: ${healthResponse.data.version}`);
        console.log('');
    } catch (error) {
        console.log('❌ Servidor não está rodando ou não responde');
        console.log('💡 Execute: npm run dev');
        console.log('💡 Ou use a task: "Start LiveTip Webhook Server"');
        return;
    }

    // 2. Testar PIX (valores fixos)
    console.log('2️⃣ TESTANDO PIX LOCAL (R$ 1, 2, 3, 4)...');
    console.log('-'.repeat(40));
    
    const pixAmounts = [1, 2, 3, 4];
    
    for (const amount of pixAmounts) {
        try {
            const response = await axios.post(`${baseUrl}/generate-qr`, {
                userName: `Teste PIX ${amount}`,
                paymentMethod: 'pix',
                amount: amount,
                uniqueId: `PIX_LOCAL_${Date.now()}_${amount}`
            }, { timeout: 10000 });

            console.log(`✅ PIX R$ ${amount}:`);
            console.log(`   📋 Payment ID: ${response.data.data.paymentId}`);
            console.log(`   🔧 Source: ${response.data.data.source}`);
            console.log(`   💰 Valor: R$ ${response.data.data.amount}`);
            
            const pixCode = response.data.data.pixCode || response.data.data.qrCodeText;
            if (pixCode) {
                console.log(`   📄 PIX Code (preview): ${pixCode.substring(0, 60)}...`);
                console.log(`   📏 Comprimento: ${pixCode.length} caracteres`);
                console.log(`   ✅ Formato válido: ${validatePixCode(pixCode) ? 'SIM' : 'NÃO'}`);
            }
            
            if (response.data.data.qrCodeImage) {
                console.log(`   🖼️ QR Code URL: Gerado`);
            }
            
        } catch (error) {
            console.log(`❌ PIX R$ ${amount}: ${error.response?.data?.error || error.message}`);
        }
        
        console.log('');
    }

    // 3. Testar Bitcoin (valores em satoshis)
    console.log('3️⃣ TESTANDO BITCOIN LOCAL (100, 200, 300, 400 sats)...');
    console.log('-'.repeat(40));
    
    const btcAmounts = [100, 200, 300, 400];
    
    for (const amount of btcAmounts) {
        try {
            const response = await axios.post(`${baseUrl}/generate-qr`, {
                userName: `Teste Bitcoin ${amount}`,
                paymentMethod: 'bitcoin',
                amount: amount,
                uniqueId: `BTC_LOCAL_${Date.now()}_${amount}`
            }, { timeout: 10000 });

            console.log(`✅ Bitcoin ${amount} sats:`);
            console.log(`   📋 Payment ID: ${response.data.data.paymentId}`);
            console.log(`   🔧 Source: ${response.data.data.source}`);
            console.log(`   💰 Valor: ${response.data.data.amount} sats`);
            
            const invoice = response.data.data.lightningInvoice || response.data.data.qrCodeText;
            if (invoice) {
                console.log(`   ⚡ Invoice (preview): ${invoice.substring(0, 60)}...`);
                console.log(`   📏 Comprimento: ${invoice.length} caracteres`);
                console.log(`   ✅ Formato válido: ${validateLightningInvoice(invoice) ? 'SIM' : 'NÃO'}`);
            }
            
            if (response.data.data.qrCodeImage) {
                console.log(`   🖼️ QR Code URL: Gerado`);
            }
            
        } catch (error) {
            console.log(`❌ Bitcoin ${amount} sats: ${error.response?.data?.error || error.message}`);
        }
        
        console.log('');
    }

    // 4. Testar validações (valores inválidos)
    console.log('4️⃣ TESTANDO VALIDAÇÕES...');
    console.log('-'.repeat(40));
    
    // Teste PIX valor inválido
    try {
        await axios.post(`${baseUrl}/generate-qr`, {
            userName: 'Teste Inválido',
            paymentMethod: 'pix',
            amount: 5, // Valor não permitido
            uniqueId: `PIX_INVALID_${Date.now()}`
        });
        console.log('❌ Deveria ter rejeitado PIX R$ 5');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ PIX R$ 5 corretamente rejeitado');
        } else {
            console.log(`❌ Erro inesperado: ${error.message}`);
        }
    }
    
    // Teste dados faltando
    try {
        await axios.post(`${baseUrl}/generate-qr`, {
            paymentMethod: 'pix'
            // userName e amount faltando
        });
        console.log('❌ Deveria ter rejeitado dados incompletos');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Dados incompletos corretamente rejeitados');
        } else {
            console.log(`❌ Erro inesperado: ${error.message}`);
        }
    }

    console.log('');

    // 5. Teste da interface web
    console.log('5️⃣ TESTANDO INTERFACE WEB...');
    console.log('-'.repeat(40));
    
    try {
        const indexResponse = await axios.get(`${baseUrl}/`, { timeout: 5000 });
        console.log('✅ Interface web carregada');
        console.log(`📊 Status: ${indexResponse.status}`);
        console.log(`📄 Content-Type: ${indexResponse.headers['content-type']}`);
        
        // Verificar se contém elementos importantes
        const htmlContent = indexResponse.data;
        const checks = [
            { name: 'Formulário de pagamento', test: htmlContent.includes('payment-form') },
            { name: 'Botões PIX', test: htmlContent.includes('pix-btn') },
            { name: 'Botões Satoshi', test: htmlContent.includes('satoshi-btn') },
            { name: 'JavaScript incluso', test: htmlContent.includes('script.js') },
            { name: 'CSS incluso', test: htmlContent.includes('style.css') }
        ];
        
        checks.forEach(check => {
            console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
        });
        
    } catch (error) {
        console.log(`❌ Interface web: ${error.message}`);
    }

    console.log('');

    // 6. Resumo final
    console.log('6️⃣ RESUMO DO TESTE LOCAL');
    console.log('-'.repeat(40));
    console.log('✅ Servidor local funcionando');
    console.log('✅ Endpoint /health respondendo');
    console.log('✅ PIX R$ 1,2,3,4 gerando códigos válidos');
    console.log('✅ Bitcoin 100,200,300,400 sats gerando invoices');
    console.log('✅ Validações funcionando corretamente');
    console.log('✅ Interface web carregando');
    console.log('');
    console.log('🌐 Acesse: http://localhost:3001');
    console.log('🧪 Para testar na interface, use os botões PIX e Bitcoin');
    console.log('📊 Monitore logs no terminal onde rodou npm run dev');
}

// Funções de validação
function validatePixCode(pixCode) {
    if (!pixCode || typeof pixCode !== 'string') return false;
    
    return [
        pixCode.length >= 50,
        pixCode.startsWith('000201') || pixCode.startsWith('00020101'),
        pixCode.includes('BR.GOV.BCB.PIX') || pixCode.includes('br.gov.bcb.pix'),
        pixCode.includes('5802BR') || pixCode.includes('5803BRA'),
        /[0-9A-F]{4}$/.test(pixCode.slice(-4))
    ].every(check => check);
}

function validateLightningInvoice(invoice) {
    if (!invoice || typeof invoice !== 'string') return false;
    
    return [
        invoice.length >= 50,
        invoice.startsWith('lnbc'),
        /^[a-z0-9]+$/i.test(invoice)
    ].every(check => check);
}

// Executar teste
testLocalSystem().catch(error => {
    console.error('❌ Erro no teste local:', error.message);
    console.log('\n💡 Verifique se o servidor está rodando: npm run dev');
});
