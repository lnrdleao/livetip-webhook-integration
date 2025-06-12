// Testes de integração para a API LiveTip - Endpoints para PIX e Bitcoin

require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Função auxiliar para salvar QR code como arquivo
function saveQRCodeToFile(dataUrl, filename) {
    if (!dataUrl) {
        console.log('⚠️ QR Code não disponível para salvar');
        return null;
    }
    
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, '..', '..', filename);
    
    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`✅ QR Code salvo em: ${filePath}`);
    return filePath;
}

// Função para testar o endpoint de PIX diretamente
async function testPixEndpoint() {
    console.log('🧪 Testando endpoint PIX do LiveTip...');
    
    try {
        // Payload para teste do PIX
        const payload = {
            sender: "Teste Integração API",
            content: "Teste direto do endpoint PIX",
            currency: "BRL",
            amount: "1.00"  // Valor mínimo para teste
        };
        
        console.log('📤 Enviando payload para API LiveTip:', JSON.stringify(payload, null, 2));
        
        // Chamada para a API
        const response = await fetch('https://api.livetip.gg/api/v1/message/10', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }
        
        // API retorna texto para PIX
        const pixCode = await response.text();
        
        console.log('✅ Resposta recebida da API:');
        console.log('📌 Código PIX:', pixCode.substring(0, 50) + '...');
        
        // Salvar código PIX em um arquivo para verificação
        fs.writeFileSync(path.join(__dirname, '..', '..', 'test-pix-code.txt'), pixCode);
        console.log('✅ Código PIX salvo em test-pix-code.txt');
        
        return pixCode;
    } catch (error) {
        console.error('❌ Erro no teste do endpoint PIX:', error);
        throw error;
    }
}

// Função para testar o endpoint de Bitcoin diretamente
async function testBitcoinEndpoint() {
    console.log('\n🧪 Testando endpoint Bitcoin do LiveTip...');
    
    try {
        // Payload para teste do Bitcoin
        const payload = {
            sender: "Teste Integração BTC",
            content: "Teste direto do endpoint Bitcoin",
            currency: "BTC",
            amount: "1000"  // 1000 satoshis para teste
        };
        
        console.log('📤 Enviando payload para API LiveTip:', JSON.stringify(payload, null, 2));
        
        // Chamada para a API
        const response = await fetch('https://api.livetip.gg/api/v1/message/10', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }
        
        // API retorna JSON para Bitcoin
        const btcResponse = await response.json();
        
        console.log('✅ Resposta recebida da API:');
        console.log(`🆔 ID: ${btcResponse.id}`);
        console.log(`💰 Valor: ${btcResponse.amount} satoshis`);
        console.log(`📌 Lightning Invoice: ${btcResponse.code.substring(0, 50)}...`);
        
        // Salvar resposta completa em um arquivo para verificação
        fs.writeFileSync(
            path.join(__dirname, '..', '..', 'test-btc-response.json'), 
            JSON.stringify(btcResponse, null, 2)
        );
        console.log('✅ Resposta JSON salva em test-btc-response.json');
        
        return btcResponse;
    } catch (error) {
        console.error('❌ Erro no teste do endpoint Bitcoin:', error);
        throw error;
    }
}

// Função principal para executar todos os testes
async function runTests() {
    console.log('🚀 Iniciando testes de integração com a API LiveTip...');
    console.log('📅 Data:', new Date().toISOString());
    console.log('-------------------------------------------');
    
    try {
        // Testar endpoint PIX
        const pixResult = await testPixEndpoint();
        
        // Testar endpoint Bitcoin
        const btcResult = await testBitcoinEndpoint();
        
        console.log('\n✅✅✅ Testes de integração concluídos com sucesso! ✅✅✅');
        console.log('Os endpoints da API LiveTip estão funcionando corretamente.');
        
    } catch (error) {
        console.error('\n❌❌❌ FALHA NOS TESTES DE INTEGRAÇÃO ❌❌❌');
        console.error('Erro:', error);
    }
}

// Executar os testes se este arquivo for executado diretamente
if (require.main === module) {
    runTests();
}

// Exportar funções para uso em outros testes
module.exports = {
    testPixEndpoint,
    testBitcoinEndpoint
};
