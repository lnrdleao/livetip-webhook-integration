// Teste local para verificar a integração com LiveTip e a geração de QR codes
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// URL do servidor local
const SERVER_URL = 'http://localhost:3001';

// Função para salvar QR code em um arquivo
function saveQRCodeToFile(dataUrl, filename) {
    if (!dataUrl) {
        console.log('⚠️ QR Code não disponível');
        return null;
    }
    
    // Remover o prefixo do data URL
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, filename);
    
    // Salvar como arquivo
    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`✅ QR Code salvo em: ${filePath}`);
    return filePath;
}

// Testar criação de pagamento PIX
async function testCreatePixPayment() {
    console.log('🧪 Testando criação de pagamento PIX...');
    
    try {
        // Criar pagamento PIX
        const response = await fetch(`${SERVER_URL}/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: "Teste Local",
                paymentMethod: "pix",
                amount: 10.50,
                email: "teste@local.com"
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Pagamento PIX criado com sucesso!');
            console.log(`🆔 ID: ${result.paymentId}`);
            console.log(`🖼️ QR Code disponível: ${result.qrCodeImage ? 'Sim' : 'Não'}`);
            
            // Salvar QR Code em um arquivo
            if (result.qrCodeImage) {
                saveQRCodeToFile(result.qrCodeImage, 'test-local-pix.png');
            }
            
            // Mostrar payload completo
            console.log('\n📦 Detalhes do pagamento:');
            console.log(JSON.stringify(result.paymentData, null, 2));
            
            return result;
        } else {
            console.error('❌ Erro ao criar pagamento PIX:', result.error);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        return null;
    }
}

// Testar criação de pagamento Bitcoin
async function testCreateBitcoinPayment() {
    console.log('\n🧪 Testando criação de pagamento Bitcoin...');
    
    try {
        // Criar pagamento Bitcoin
        const response = await fetch(`${SERVER_URL}/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: "Teste Local BTC",
                paymentMethod: "bitcoin",
                amount: 100, // 100 satoshis
                email: "teste@local.com",
                uniqueId: `BTC_${Date.now()}_TEST`
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Pagamento Bitcoin criado com sucesso!');
            console.log(`🆔 ID: ${result.paymentId}`);
            console.log(`🖼️ QR Code disponível: ${result.qrCodeImage ? 'Sim' : 'Não'}`);
            
            // Salvar QR Code em um arquivo
            if (result.qrCodeImage) {
                saveQRCodeToFile(result.qrCodeImage, 'test-local-btc.png');
            }
            
            // Mostrar payload completo
            console.log('\n📦 Detalhes do pagamento:');
            console.log(JSON.stringify(result.paymentData, null, 2));
            
            return result;
        } else {
            console.error('❌ Erro ao criar pagamento Bitcoin:', result.error);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        return null;
    }
}

// Testar geração de QR Code diretamente
async function testGenerateQR() {
    console.log('\n🧪 Testando geração direta de QR Code...');
    
    try {
        // Gerar QR Code
        const response = await fetch(`${SERVER_URL}/generate-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: "Teste QR Direct",
                paymentMethod: "pix",
                amount: 5.75
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ QR Code gerado com sucesso!');
            console.log(`🆔 ID: ${result.data.paymentId}`);
            console.log(`🖼️ QR Code disponível: ${result.data.qrCodeImage ? 'Sim' : 'Não'}`);
            
            // Salvar QR Code em um arquivo
            if (result.data.qrCodeImage) {
                saveQRCodeToFile(result.data.qrCodeImage, 'test-local-qr-direct.png');
            }
            
            return result;
        } else {
            console.error('❌ Erro ao gerar QR Code:', result.error);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        return null;
    }
}

// Testar endpoints principais
async function testEndpoints() {
    console.log('\n🧪 Testando endpoints principais...');
    
    try {
        // Verificar status da API
        const response = await fetch(`${SERVER_URL}/health`);
        const health = await response.json();
        
        console.log('✅ API Status:', health.status);
        console.log('   Pagamentos:', health.payments);
        console.log('   Versão:', health.version);
        console.log('   Uptime:', health.uptime);
        
        return health;
    } catch (error) {
        console.error('❌ Erro ao verificar status:', error.message);
        return null;
    }
}

// Executar testes
async function runLocalTests() {
    console.log('🚀 Iniciando testes locais do LiveTip...');
    console.log(`🔗 URL do servidor: ${SERVER_URL}`);
    console.log('📅 Data:', new Date().toISOString());
    console.log('---------------------------------------------');
    
    try {
        // Verificar se o servidor está rodando
        await testEndpoints();
        
        // Testar criação de pagamentos
        const pixResult = await testCreatePixPayment();
        const btcResult = await testCreateBitcoinPayment();
        const qrResult = await testGenerateQR();
        
        console.log('\n---------------------------------------------');
        console.log('🏁 Testes locais concluídos!');
        
        // Resumo dos resultados
        console.log('\n📋 Resumo dos testes:');
        console.log(`   PIX Payment: ${pixResult?.success ? '✅' : '❌'}`);
        console.log(`   Bitcoin Payment: ${btcResult?.success ? '✅' : '❌'}`);
        console.log(`   QR Direct: ${qrResult?.success ? '✅' : '❌'}`);
        
        // Verificar se os arquivos foram gerados
        console.log('\n📄 Arquivos gerados:');
        const files = ['test-local-pix.png', 'test-local-btc.png', 'test-local-qr-direct.png'];
        files.forEach(file => {
            const exists = fs.existsSync(path.join(__dirname, file));
            console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
        });
        
    } catch (error) {
        console.error('\n❌ Erro fatal nos testes:', error);
    }
}

// Executar todos os testes
runLocalTests().catch(console.error);
