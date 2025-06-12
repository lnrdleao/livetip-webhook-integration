const fetch = require('node-fetch');
const colors = require('colors');

// URL da API em produção
const PRODUCTION_API_URL = 'https://livetip-payment.vercel.app/api';
// Código PIX de teste
const PIX_CODE_TEST = 'teste123';

async function monitorQRCodeGeneration() {
    console.log(colors.yellow('=== Monitorando geração de QR Code PIX em produção ==='));
    
    try {
        console.log(colors.blue('1. Enviando requisição para gerar QR Code PIX...'));
        const response = await fetch(`${PRODUCTION_API_URL}/pix/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                pixCode: PIX_CODE_TEST,
                amount: 10.00,
                description: 'Teste de monitoramento'
            })
        });
        
        const responseData = await response.json().catch(() => ({}));
        console.log(colors.blue(`Status da resposta: ${response.status} ${response.statusText}`));
        
        if (response.ok) {
            console.log(colors.green('✓ QR Code gerado com sucesso!'));
            console.log(colors.gray('Resposta:'), responseData);
            
            // Verificar se o QR Code foi realmente gerado
            if (responseData.qrCodeUrl) {
                console.log(colors.green(`✓ URL do QR Code: ${responseData.qrCodeUrl}`));
                
                // Testar acesso ao QR Code
                console.log(colors.blue('2. Verificando se o QR Code está acessível...'));
                const qrResponse = await fetch(responseData.qrCodeUrl);
                console.log(colors.blue(`Status do QR Code: ${qrResponse.status} ${qrResponse.statusText}`));
                
                if (qrResponse.ok) {
                    console.log(colors.green('✓ QR Code está acessível!'));
                } else {
                    console.log(colors.red(`✗ QR Code NÃO está acessível! Status: ${qrResponse.status}`));
                }
            } else {
                console.log(colors.red('✗ URL do QR Code não encontrada na resposta!'));
            }
        } else {
            console.log(colors.red(`✗ Erro ao gerar QR Code: ${response.status}`));
            console.log(colors.gray('Detalhes do erro:'), responseData);
            
            // Análise específica de erros comuns
            if (response.status === 500) {
                console.log(colors.yellow('Análise do erro interno do servidor:'));
                console.log(colors.yellow('- Possível erro com o módulo canvas no ambiente serverless'));
                console.log(colors.yellow('- Verificando se o fallback está funcionando corretamente'));
            }
        }
    } catch (error) {
        console.log(colors.red('✗ Erro ao executar o teste:'), error.message);
    }
    
    console.log(colors.yellow('=== Fim do monitoramento ==='));
}

// Executar o monitoramento
monitorQRCodeGeneration();
