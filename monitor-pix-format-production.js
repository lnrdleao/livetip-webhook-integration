# filepath: c:\Users\Leonardo\OneDrive\Área de Trabalho\LiveTip\Página Pagto Test\monitor-pix-format-production.js
/**
 * Monitor PIX Format in Production
 * Este script verifica se o formato do código PIX está correto na produção
 * após o deploy da correção.
 */

const fetch = require('node-fetch');

// Cores para o console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

console.log(`${colors.cyan}🔍 VERIFICAÇÃO DO FORMATO DO CÓDIGO PIX EM PRODUÇÃO${colors.reset}`);
console.log(`${colors.cyan}===============================================${colors.reset}`);
console.log(`Data: ${new Date().toLocaleString()}\n`);

// URL da API em produção
const PRODUCTION_URL = 'https://livetip-webhook-integration.vercel.app/create-payment';

async function testPixFormat() {
    try {
        console.log(`${colors.blue}Enviando requisição para criar pagamento PIX em produção...${colors.reset}`);
        
        const payload = {
            userName: 'MonitorProduction',
            paymentMethod: 'pix',
            amount: 1.00,
            uniqueId: `monitor_${Date.now()}`
        };
        
        const response = await fetch(PRODUCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log(`${colors.blue}Status da resposta: ${response.status}${colors.reset}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`${colors.red}❌ Erro ao criar pagamento PIX: ${response.status} - ${errorText}${colors.reset}`);
            return false;
        }
        
        const result = await response.json();
        
        // Verificar se o pagamento foi criado com sucesso
        if (!result.success) {
            console.log(`${colors.red}❌ Falha ao criar pagamento: ${result.error || 'Erro desconhecido'}${colors.reset}`);
            return false;
        }
        
        // Verificar se o código PIX existe
        if (!result.paymentData || !result.paymentData.pixCode) {
            console.log(`${colors.red}❌ Código PIX não encontrado na resposta${colors.reset}`);
            return false;
        }
        
        const pixCode = result.paymentData.pixCode;
        console.log(`${colors.green}📝 Código PIX recebido:${colors.reset}`);
        console.log(pixCode.substring(0, 60) + '...');
        
        // Verificar se o código PIX é uma string JSON
        let isJsonString = false;
        try {
            const jsonTest = JSON.parse(pixCode);
            if (jsonTest && jsonTest.code) {
                isJsonString = true;
                console.log(`${colors.red}❌ ERRO: O código PIX ainda está em formato JSON!${colors.reset}`);
            }
        } catch (e) {
            // Não é JSON - isso é bom!
            console.log(`${colors.green}✅ SUCESSO: Código PIX está no formato correto (texto puro)!${colors.reset}`);
        }
        
        // Verificar se o código começa com o padrão EMV
        if (pixCode.startsWith('00020101')) {
            console.log(`${colors.green}✅ FORMATO EMV: O código PIX tem um padrão EMV válido (00020101)${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠️ AVISO: O código PIX não começa com o padrão EMV esperado${colors.reset}`);
        }
        
        // Resultado final
        if (!isJsonString && pixCode.length > 50) {
            console.log(`\n${colors.green}🎉 VALIDAÇÃO BEM-SUCEDIDA! O código PIX está no formato correto em produção.${colors.reset}`);
            return true;
        } else {
            console.log(`\n${colors.red}❌ VALIDAÇÃO FALHOU! O código PIX precisa de ajustes em produção.${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}❌ Erro ao executar teste: ${error.message}${colors.reset}`);
        return false;
    }
}

async function main() {
    try {
        console.log(`${colors.yellow}Iniciando teste de formato do PIX em produção...${colors.reset}\n`);
        
        const result = await testPixFormat();
        
        console.log(`\n${colors.cyan}📊 RESULTADO DA VERIFICAÇÃO EM PRODUÇÃO${colors.reset}`);
        console.log(`${colors.cyan}======================================${colors.reset}`);
        
        if (result) {
            console.log(`${colors.green}✅ CORREÇÃO APLICADA COM SUCESSO EM PRODUÇÃO!${colors.reset}`);
            console.log(`${colors.green}📱 A aplicação está pronta para uso com códigos PIX no formato correto${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ CORREÇÃO NÃO ESTÁ FUNCIONANDO EM PRODUÇÃO!${colors.reset}`);
            console.log(`${colors.red}⚠️ Revise o deploy e verifique os logs do servidor${colors.reset}`);
        }
        
        console.log(`\n${colors.cyan}Verificação concluída em: ${new Date().toLocaleString()}${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}Erro fatal na verificação: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Executar a verificação
main().catch(error => {
    console.error(`${colors.red}Erro não tratado: ${error.message}${colors.reset}`);
    process.exit(1);
});
