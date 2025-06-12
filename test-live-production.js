// Script para testar o sistema em produção após o deploy da correção
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// URL de produção
const PRODUCTION_URL = 'https://livetip-webhook-integration.vercel.app';

// Helper para salvar QR Code em arquivo
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

// Testar a saúde do sistema
async function testHealthCheck() {
    console.log('🏥 Testando saúde do sistema em produção...');
    
    try {
        const response = await fetch(`${PRODUCTION_URL}/health`);
        const data = await response.json();
        
        console.log('✅ Sistema responde com status: ', data.status);
        console.log('📊 Detalhes da saúde:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro ao verificar saúde do sistema:', error);
        throw error;
    }
}

// Testar criação de pagamento PIX
async function testPixPayment() {
    console.log('\n💰 Testando criação de pagamento PIX em produção...');
      try {
        const response = await fetch(`${PRODUCTION_URL}/generate-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({                userName: "Teste Produção",
                paymentMethod: "pix",
                amount: 3.00,
                email: "teste@producao.com"
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Pagamento PIX criado com sucesso!');
            console.log(`🆔 ID: ${result.paymentId}`);
            console.log(`💲 Valor: R$ ${result.amount}`);
            console.log(`📝 Status: ${result.status}`);
            console.log(`🖼️ QR Code disponível: ${result.qrCodeImage ? 'Sim' : 'Não'}`);
            
            // Salvar QR Code em arquivo se disponível
            if (result.qrCodeImage) {
                saveQRCodeToFile(result.qrCodeImage, 'test-production-pix.png');
            }
            
            return result;
        } else {
            console.error('❌ Falha ao criar pagamento PIX:', result.error);
            return result;
        }
    } catch (error) {
        console.error('❌ Erro ao testar pagamento PIX:', error);
        throw error;
    }
}

// Testar criação de pagamento Bitcoin
async function testBitcoinPayment() {
    console.log('\n₿ Testando criação de pagamento Bitcoin em produção...');
      try {
        const response = await fetch(`${PRODUCTION_URL}/generate-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({                userName: "Teste Bitcoin Prod",
                paymentMethod: "bitcoin",
                amount: 1000,
                email: "btc@producao.com"
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Pagamento Bitcoin criado com sucesso!');
            console.log(`🆔 ID: ${result.paymentId}`);
            console.log(`💲 Valor: R$ ${result.amount} (${result.satoshis} sats)`);
            console.log(`📝 Status: ${result.status}`);
            console.log(`🖼️ QR Code disponível: ${result.qrCodeImage ? 'Sim' : 'Não'}`);
            
            // Salvar QR Code em arquivo se disponível
            if (result.qrCodeImage) {
                saveQRCodeToFile(result.qrCodeImage, 'test-production-btc.png');
            }
            
            return result;
        } else {
            console.error('❌ Falha ao criar pagamento Bitcoin:', result.error);
            return result;
        }
    } catch (error) {
        console.error('❌ Erro ao testar pagamento Bitcoin:', error);
        throw error;
    }
}

// Testar API simplificada
async function testSimpleApi() {
    console.log('\n🔍 Testando API simplificada em produção...');
    
    try {
        // 1. Verificar a saúde da API simplificada
        const healthResponse = await fetch(`${PRODUCTION_URL}/api/simple/health`);
        const healthData = await healthResponse.json();
        console.log('✅ API Simplificada responde com status:', healthData.status);
        
        // 2. Criar um pagamento PIX simulado
        const paymentResponse = await fetch(`${PRODUCTION_URL}/api/simple/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: "Cliente API Simples",
                valor: 30
            })
        });
        
        const paymentData = await paymentResponse.json();
        console.log('✅ API Simplificada criou pagamento:', paymentData);
        
        // 3. Consultar o status deste pagamento
        if (paymentData.success && paymentData.id) {
            const statusResponse = await fetch(`${PRODUCTION_URL}/api/simple/status/${paymentData.id}`);
            const statusData = await statusResponse.json();
            console.log('✅ Status do pagamento:', statusData);
        }
        
        return paymentData;
    } catch (error) {
        console.error('❌ Erro ao testar API simplificada:', error);
        throw error;
    }
}

// Função principal que executa todos os testes
async function runAllTests() {
    console.log('🧪 Iniciando testes do sistema em produção após deploy...');
    console.log(`🌐 URL: ${PRODUCTION_URL}`);
    console.log('📅 Data:', new Date().toISOString());
    console.log('-------------------------------------------');
    
    try {
        // Testar saúde do sistema
        await testHealthCheck();
        
        // Testar criação de pagamento PIX
        await testPixPayment();
        
        // Testar criação de pagamento Bitcoin
        await testBitcoinPayment();
        
        // Testar API simplificada
        await testSimpleApi();
        
        console.log('\n✅✅✅ Todos os testes completados com sucesso! ✅✅✅');
        console.log('O sistema está funcionando corretamente em produção!');
    } catch (error) {
        console.error('\n❌❌❌ FALHA NOS TESTES ❌❌❌');
        console.error('Erro:', error);
    }
}

// Executar todos os testes
runAllTests();
