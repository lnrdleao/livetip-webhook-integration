// Script de diagnóstico completo para a aplicação LiveTip
// Este script verifica cada componente do sistema, incluindo o gerador de QR code

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Cores para console
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

// URLs dos ambientes
const PRODUCTION_URL = 'https://livetip-payment.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

// Função para registrar saída colorida
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisições HTTP/HTTPS
async function fetchUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : require('http');
        const req = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Verifica se o arquivo existe
function checkFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (err) {
        return false;
    }
}

// Verifica dependências do package.json
function checkDependencies() {
    log('🔍 Verificando dependências do projeto...', 'blue');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = packageJson.dependencies || {};
        
        log(`📦 Dependências encontradas: ${Object.keys(dependencies).length}`, 'cyan');
        
        // Verificar dependências necessárias
        const requiredDeps = ['node-fetch', 'colors', 'canvas'];
        const missingDeps = [];
        
        for (const dep of requiredDeps) {
            if (!dependencies[dep]) {
                missingDeps.push(dep);
            }
        }
        
        if (missingDeps.length > 0) {
            log(`⚠️ Dependências ausentes: ${missingDeps.join(', ')}`, 'yellow');
            log('💡 Recomendação: Execute "npm install ' + missingDeps.join(' ') + '"', 'yellow');
        } else {
            log('✅ Todas as dependências necessárias estão instaladas', 'green');
        }
    } catch (error) {
        log(`❌ Erro ao verificar dependências: ${error.message}`, 'red');
    }
}

// Verificar arquivos do sistema de QR Code
function checkQRCodeSystem() {
    log('\n🔍 Verificando sistema de geração de QR Code...', 'blue');
    
    const requiredFiles = [
        'qrCodeGenerator.js',
        'qrCodeGeneratorFallback.js'
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
        if (checkFileExists(file)) {
            log(`✅ Arquivo ${file} encontrado`, 'green');
        } else {
            log(`❌ Arquivo ${file} NÃO encontrado`, 'red');
            allFilesExist = false;
        }
    }
    
    // Verificar implementação do módulo QR Code
    if (allFilesExist) {
        log('\n🔍 Testando implementação do módulo QR Code...', 'blue');
        try {
            const qrModule = require('./qrCodeGenerator');
            
            if (typeof qrModule.generateWithLogo === 'function') {
                log('✅ Método generateWithLogo encontrado', 'green');
            } else {
                log('❌ Método generateWithLogo NÃO foi implementado corretamente', 'red');
            }
            
            log('🔍 Testando geração de QR Code de teste...', 'blue');
            qrModule.generateWithLogo('TESTE_QR_CODE', 'pix')
                .then(result => {
                    log(`✅ QR Code gerado com sucesso: ${result.substring(0, 50)}...`, 'green');
                })
                .catch(error => {
                    log(`❌ Falha ao gerar QR Code: ${error.message}`, 'red');
                });
        } catch (error) {
            log(`❌ Erro ao testar módulo QR Code: ${error.message}`, 'red');
        }
    }
}

// Verificar configuração do Vercel
function checkVercelConfig() {
    log('\n🔍 Verificando configuração do Vercel...', 'blue');
    
    if (checkFileExists('vercel.json')) {
        try {
            const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
            log('✅ Arquivo vercel.json encontrado e válido', 'green');
            
            // Verificar includeFiles
            if (vercelConfig.functions && 
                vercelConfig.functions['api/index.js'] && 
                vercelConfig.functions['api/index.js'].includeFiles === 'qrCodeGeneratorFallback.js') {
                log('✅ Configuração de includeFiles correta para o fallback', 'green');
            } else {
                log('⚠️ A configuração de includeFiles para qrCodeGeneratorFallback.js não está correta', 'yellow');
                log('💡 Recomendação: Adicione "includeFiles": "qrCodeGeneratorFallback.js" em functions["api/index.js"]', 'yellow');
            }
        } catch (error) {
            log(`❌ Erro ao analisar vercel.json: ${error.message}`, 'red');
        }
    } else {
        log('❌ Arquivo vercel.json NÃO encontrado', 'red');
    }
}

// Testar API em produção
async function testProductionAPI() {
    log('\n🔍 Testando API em produção...', 'blue');
    
    try {
        const testData = {
            pixCode: 'TESTE123',
            amount: 2.00,
            description: 'Teste de diagnóstico'
        };
        
        log(`📤 Enviando requisição para ${PRODUCTION_URL}/api/pix/generate...`, 'blue');
        
        const response = await fetchUrl(`${PRODUCTION_URL}/api/pix/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        log(`📥 Status da resposta: ${response.status}`, 'cyan');
        
        // Verificar resposta
        if (response.status === 200) {
            log('✅ API retornou status 200 (OK)', 'green');
            
            try {
                const data = JSON.parse(response.body);
                if (data.qrCodeUrl) {
                    log(`✅ URL do QR Code recebida: ${data.qrCodeUrl.substring(0, 50)}...`, 'green');
                    
                    // Verificar se a URL é da API de fallback
                    if (data.qrCodeUrl.includes('api.qrserver.com')) {
                        log('✅ Sistema está usando o fallback corretamente em produção', 'green');
                    } else {
                        log('ℹ️ Sistema está usando gerador primário', 'blue');
                    }
                } else {
                    log('❌ URL do QR Code não encontrada na resposta', 'red');
                }
            } catch (error) {
                log(`❌ Erro ao analisar resposta JSON: ${error.message}`, 'red');
                log(`Resposta bruta: ${response.body.substring(0, 200)}...`, 'gray');
            }
        } else {
            log(`❌ API retornou status ${response.status} (erro)`, 'red');
            log(`Resposta de erro: ${response.body.substring(0, 200)}...`, 'gray');
        }
    } catch (error) {
        log(`❌ Erro ao testar API em produção: ${error.message}`, 'red');
    }
}

// Função principal
async function runDiagnostic() {
    log('🚀 Iniciando diagnóstico completo do sistema LiveTip...', 'magenta');
    
    checkDependencies();
    checkQRCodeSystem();
    checkVercelConfig();
    await testProductionAPI();
    
    log('\n🏁 Diagnóstico concluído!', 'magenta');
}

// Executar diagnóstico
runDiagnostic();
