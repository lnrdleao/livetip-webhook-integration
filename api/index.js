// LiveTip API - Production Ready (Based on Working Local Server)
const https = require('https');
const path = require('path');

// Importar o módulo de geração de QR code com fallback
let qrCodeGenerator;
try {
    // Tentativa 1: Importar usando caminho relativo padrão
    qrCodeGenerator = require('../qrCodeGenerator');
    console.log('✅ QR Code Generator carregado com sucesso (caminho relativo padrão)');
} catch (e) {
    try {
        // Tentativa 2: Importar usando path.join para resolver o caminho
        const rootDir = path.resolve('./');
        qrCodeGenerator = require(path.join(rootDir, 'qrCodeGeneratorFallback'));
        console.log('✅ QR Code Generator Fallback carregado com sucesso');
    } catch (err) {
        // Fallback para API externa direta se ambas tentativas falharem
        console.error('⚠️ Erro ao carregar QR Code Generator:', err.message);
        console.log('⚠️ Usando API externa direta como último recurso');
        qrCodeGenerator = {
            generateWithLogo: (text) => `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`
        };
    }
}

// In-memory storage for payments and webhook logs (in production, use a database)
const payments = new Map();
const webhookLogs = [];

// PIX configuration (melhores práticas bancárias)
const PIX_CONFIG = {
    key: 'pagamentos@livetip.gg',
    receiverName: 'LIVETIP PAGAMENTOS',
    city: 'SAO PAULO',
    merchantCategoryCode: '0000',
    currency: '986', // BRL
    allowedAmounts: [1, 2, 3, 4], // Valores permitidos em reais
    maxAmount: 4.00,
    minAmount: 1.00
};

// Validação PIX seguindo padrões bancários
function validatePixPayment(amount, userName) {
    const errors = [];
    
    // Validar valor
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
        errors.push('Valor deve ser numérico');
    } else {
        // Verificar se o valor está na lista de permitidos (aceita 1, 1.0, 1.00, etc.)
        const allowedAmountsNormalized = PIX_CONFIG.allowedAmounts.map(v => parseFloat(v));
        if (!allowedAmountsNormalized.includes(amountValue)) {
            errors.push(`Valor deve ser um dos permitidos: R$ ${PIX_CONFIG.allowedAmounts.join(', ')}`);
        } else if (amountValue < PIX_CONFIG.minAmount || amountValue > PIX_CONFIG.maxAmount) {
            errors.push(`Valor deve estar entre R$ ${PIX_CONFIG.minAmount} e R$ ${PIX_CONFIG.maxAmount}`);
        }
    }
    
    // Validar nome do usuário
    if (!userName || userName.trim().length < 2) {
        errors.push('Nome do usuário é obrigatório (mínimo 2 caracteres)');
    } else if (userName.length > 50) {
        errors.push('Nome do usuário muito longo (máximo 50 caracteres)');
    }
    
    // Validar caracteres especiais no nome
    if (userName && !/^[a-zA-ZÀ-ÿ\s0-9]+$/.test(userName)) {
        errors.push('Nome deve conter apenas letras, números e espaços');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        sanitizedName: userName ? userName.trim().substring(0, 50) : '',
        validatedAmount: amountValue
    };
}

// Generate UUID
function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Generate PIX code (EMV format)
function generatePixCode(amount, description, txId) {
    const pixKey = PIX_CONFIG.key;
    const merchantName = PIX_CONFIG.receiverName;
    const city = PIX_CONFIG.city;
    
    let pix = '00020126';
    const merchant = '0014BR.GOV.BCB.PIX01' + String(pixKey.length).padStart(2, '0') + pixKey;
    pix += '58' + String(merchant.length).padStart(2, '0') + merchant;
    pix += '52040000';
    pix += '5303986';
    pix += '54' + String(parseFloat(amount).toFixed(2).length).padStart(2, '0') + parseFloat(amount).toFixed(2);
    pix += '5802BR';
    pix += '59' + String(merchantName.length).padStart(2, '0') + merchantName;
    pix += '60' + String(city.length).padStart(2, '0') + city;
    
    const additionalData = '05' + String(txId.substring(0, 25).length).padStart(2, '0') + txId.substring(0, 25);
    pix += '62' + String(additionalData.length).padStart(2, '0') + additionalData;
    pix += '6304';
    
    // CRC16 calculation
    let crc = 0xFFFF;
    for (let i = 0; i < pix.length; i++) {
        crc ^= (pix.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
        }
    }
    
    return pix + crc.toString(16).toUpperCase().padStart(4, '0');
}

// Call LiveTip API - Endpoint oficial v235 com melhores práticas PIX
function callLiveTipAPI(paymentMethod, userName, amount, externalId) {
    return new Promise((resolve, reject) => {
        // Usar let em vez de const para o payload, já que ele será reatribuído
        let payload;
        
        if (paymentMethod === 'pix') {
            // Para PIX: formato oficial da API LiveTip v10
            payload = {
                sender: userName || "usuario_webhook",
                content: `Pagamento LiveTip - R$ ${parseFloat(amount).toFixed(2)}`,
                currency: "BRL",
                amount: parseFloat(amount).toFixed(2) // Formato decimal obrigatório
            };
        } else {
            // Para Bitcoin: formato em satoshis (mínimo 100 sats)
            const satoshis = parseInt(amount);
            if (satoshis < 100) {
                reject(new Error('Valor mínimo para Bitcoin é 100 satoshis'));
                return;
            }
            
            payload = {
                sender: userName,
                content: `Payment - ${satoshis} sats`,
                currency: 'BTC',
                amount: satoshis.toString()
            };
        }
        
        const postData = JSON.stringify(payload);          console.log(`🚀 Enviando para API LiveTip v10 (${paymentMethod}):`, payload);
        console.log('📡 Endpoint oficial: https://api.livetip.gg/api/v1/message/10');
        console.log('🔐 Método: POST (sem autenticação necessária)');
        
        const options = {
            hostname: 'api.livetip.gg',
            port: 443,
            path: '/api/v1/message/10',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 15000
        };
          const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log(`📥 Resposta da API LiveTip v10 (${response.statusCode}):`, data.substring(0, 200));
                
                // Validação robusta de resposta
                if (response.statusCode !== 200 && response.statusCode !== 201) {
                    console.log(`⚠️ Status HTTP inválido: ${response.statusCode}`);
                    reject(new Error(`HTTP ${response.statusCode}: ${data}`));
                    return;
                }
                
                // Detecção de resposta HTML (erro do servidor)
                if (data.trim().startsWith('<') || data.includes('<!DOCTYPE') || data.includes('<html>')) {
                    console.log('⚠️ API retornou HTML (erro do servidor)');
                    reject(new Error('API returned HTML error page'));
                    return;
                }
                
                try {
                    // Tentar parsear como JSON (formato preferido)
                    const parsed = JSON.parse(data);
                    
                    if (parsed.code && typeof parsed.code === 'string' && parsed.code.length > 20) {
                        // Validação específica para PIX
                        if (paymentMethod === 'pix') {
                            if (parsed.code.includes('BR.GOV.BCB.PIX') || parsed.code.startsWith('00020126')) {
                                console.log('✅ Código PIX válido recebido (formato EMV)');                                resolve({ 
                                    code: parsed.code, 
                                    id: parsed.id || externalId,
                                    type: 'pix_emv',
                                    source: 'livetip_api_v10'
                                });
                            } else {
                                console.log('⚠️ Código PIX inválido (formato não EMV)');
                                reject(new Error('Invalid PIX EMV format'));
                            }
                        } else {
                            // Bitcoin/Lightning
                            console.log('✅ Código de pagamento recebido');                            resolve({ 
                                code: parsed.code, 
                                id: parsed.id || externalId,
                                type: 'lightning',
                                source: 'livetip_api_v10'
                            });
                        }
                    } else {
                        console.log('⚠️ JSON sem código válido:', parsed);
                        reject(new Error('Response missing valid payment code'));
                    }
                    
                } catch (jsonError) {
                    // Fallback: verificar se é código direto (texto puro)
                    const cleanData = data.trim();
                    
                    if (paymentMethod === 'pix' && cleanData.length > 50 && 
                        (cleanData.startsWith('00020126') || cleanData.includes('BR.GOV.BCB.PIX'))) {
                        console.log('✅ Código PIX direto recebido (texto puro)');                        resolve({ 
                            code: cleanData, 
                            id: externalId,
                            type: 'pix_emv',
                            source: 'livetip_api_v10_text'
                        });
                    } else {
                        console.log('⚠️ Formato de resposta inválido:', jsonError.message);
                        reject(new Error(`Invalid response format: ${jsonError.message}`));
                    }
                }
            });
        });
        
        request.on('timeout', () => {
            console.log('⏰ Timeout da API LiveTip');
            request.destroy();
            reject(new Error('Request timeout'));
        });
        
        request.on('error', (error) => {
            console.log('❌ Erro na requisição LiveTip:', error.message);
            reject(error);
        });
        
        request.write(postData);
        request.end();
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Livetip-Webhook-Secret-Token');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const { url, method } = req;
    
    // Routes
    if (url === '/' && method === 'GET') {
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
    <title>LiveTip Payment System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; margin: 0; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .btn { background: #007bff; color: white; padding: 15px; text-decoration: none; border-radius: 8px; text-align: center; display: block; transition: all 0.3s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .btn.success { background: #28a745; }
        .btn.secondary { background: #6c757d; }
        h1 { color: #333; margin-bottom: 10px; }
        .status { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 LiveTip Payment System</h1>
        <div class="card">
            <h3>Status: <span class="status">✅ Online</span></h3>
            <p>PIX and Bitcoin payments ready with LiveTip API integration and robust fallback system.</p>
            <p><strong>Server:</strong> Vercel Production | <strong>Version:</strong> 2.0.0</p>
        </div>
        <div class="grid">
            <a href="/control" class="btn">📊 Control Panel</a>
            <a href="/webhook-monitor" class="btn success">🎯 Webhook Monitor</a>
            <a href="/webhook" class="btn secondary">⚙️ Webhook Status</a>
            <a href="/health" class="btn secondary">💚 Health Check</a>
        </div>
    </div>
</body>
</html>`);
    }    
    if (url === '/control' && method === 'GET') {
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
    <title>Control Panel - LiveTip</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; margin: 0; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .status-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .status-ok { color: #28a745; font-weight: bold; }
        .btn { background: #6c757d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        h1 { color: #333; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Control Panel</h1>
        <div class="card">
            <h3>System Status</h3>
            <div class="status-grid">
                <div class="status-item">
                    <h4>API Status</h4>
                    <div class="status-ok">✅ Online</div>
                </div>
                <div class="status-item">
                    <h4>PIX Payments</h4>
                    <div class="status-ok">✅ Ready</div>
                </div>
                <div class="status-item">
                    <h4>Bitcoin Payments</h4>
                    <div class="status-ok">✅ Ready</div>
                </div>
                <div class="status-item">
                    <h4>LiveTip Integration</h4>
                    <div class="status-ok">✅ Active</div>
                </div>
                <div class="status-item">
                    <h4>Fallback System</h4>
                    <div class="status-ok">✅ Ready</div>
                </div>
                <div class="status-item">
                    <h4>Webhook Monitor</h4>
                    <div class="status-ok">✅ Active</div>
                </div>
            </div>
        </div>
        <a href="/" class="btn">← Back to Home</a>
    </div>
</body>
</html>`);
    }
      if (url === '/webhook-monitor' && method === 'GET') {
        // Servir o arquivo HTML completo do webhook monitor (versão anterior)
        const fs = require('fs');
        const path = require('path');
        
        try {
            const htmlPath = path.join(process.cwd(), 'public', 'webhook-monitor.html');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(htmlContent);
        } catch (error) {
            // Fallback HTML se não conseguir ler o arquivo
            return res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webhook Monitor - LiveTip</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 2rem; color: white; }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .status-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .status-card { background: white; border-radius: 15px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
        .status-indicator { width: 20px; height: 20px; border-radius: 50%; display: inline-block; margin-right: 10px; }
        .status-active { background-color: #28a745; }
        .card { background: white; border-radius: 15px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 1rem; }
        .btn { background: #6c757d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; transition: all 0.3s; }
        .btn:hover { transform: translateY(-2px); }
        .endpoint { background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; margin: 10px 0; border-left: 4px solid #007bff; }
        .log-entry { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Webhook Monitor</h1>
            <p>Monitoramento em tempo real dos webhooks LiveTip</p>
        </div>
        
        <div class="status-cards">
            <div class="status-card">
                <h3><span class="status-indicator status-active"></span>Status do Webhook</h3>
                <p>✅ Ativo e funcionando</p>
            </div>
            <div class="status-card">
                <h3><span class="status-indicator status-active"></span>Endpoint</h3>
                <p>✅ /webhook configurado</p>
            </div>
            <div class="status-card">
                <h3><span class="status-indicator status-active"></span>Autenticação</h3>
                <p>✅ Token válido configurado</p>
            </div>
        </div>

        <div class="card">
            <h3>📡 Configuração do Webhook</h3>
            <p><strong>URL do Endpoint:</strong></p>
            <div class="endpoint">POST https://livetip-webhook-integration-ri27ly3to.vercel.app/webhook</div>
            
            <p><strong>Headers Obrigatórios:</strong></p>
            <div class="endpoint">X-Livetip-Webhook-Secret-Token: 0ac7b9aa00e75e0215243f3bb177c844</div>
            <div class="endpoint">Content-Type: application/json</div>
        </div>

        <div class="card">
            <h3>📊 Logs Recentes</h3>
            <div id="webhook-logs">
                <div class="log-entry">
                    <strong>Sistema iniciado:</strong> ${new Date().toLocaleString('pt-BR')}
                </div>
            </div>
        </div>
        
        <a href="/" class="btn">← Voltar ao Início</a>
    </div>

    <script>
        // Auto-refresh da página a cada 30 segundos
        setInterval(() => {
            const now = new Date().toLocaleString('pt-BR');
            console.log('Webhook Monitor ativo:', now);
        }, 30000);
    </script>
</body>
</html>`);
        }
    }
    if (url === '/webhook' && method === 'GET') {
        const stats = {
            totalWebhooks: webhookLogs.length,
            totalPayments: payments.size,
            lastWebhook: webhookLogs.length > 0 ? webhookLogs[webhookLogs.length - 1] : null,
            status: 'active',
            endpoint: '/webhook',
            timestamp: new Date().toISOString()
        };

        return res.status(200).json({
            message: 'LiveTip Webhook Endpoint Active',
            description: 'This endpoint receives payment confirmations via POST',
            ...stats,
            instructions: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Livetip-Webhook-Secret-Token': '0ac7b9aa00e75e0215243f3bb177c844'
                },
                monitor_url: 'https://livetip-webhook-integration.vercel.app/webhook-monitor'
            }
        });
    }
      if (url === '/webhook' && method === 'POST') {
        const token = req.headers['x-livetip-webhook-secret-token'];
        if (token !== '0ac7b9aa00e75e0215243f3bb177c844') {
            return res.status(401).json({ error: 'Invalid webhook token' });
        }

        console.log('🔔 Webhook recebido:', JSON.stringify(req.body, null, 2));

        // Processar webhook de confirmação de pagamento
        const { event, payment } = req.body;
        
        if (event === 'payment_confirmed' && payment) {
            const { sender, content, amount, currency, paid, paymentId: liveTipPaymentId } = payment;
            
            console.log(`💰 Processando confirmação de pagamento:
                🆔 LiveTip ID: ${liveTipPaymentId}
                👤 Sender: ${sender}
                💵 Amount: ${amount} ${currency}
                ✅ Paid: ${paid}
                📝 Content: ${content}`);
            
            // Encontrar pagamento local correspondente
            let foundPayment = null;
            let matchMethod = '';
            
            // Método 1: Match por uniqueId no content (para Bitcoin)
            if (content) {
                for (let [localId, storedPayment] of payments.entries()) {
                    if (storedPayment.uniqueId && content.includes(storedPayment.uniqueId)) {
                        foundPayment = storedPayment;
                        foundPayment.localId = localId;
                        matchMethod = 'uniqueId';
                        break;
                    }
                }
            }
            
            // Método 2: Match por liveTipPaymentId
            if (!foundPayment) {
                for (let [localId, storedPayment] of payments.entries()) {
                    if (storedPayment.liveTipPaymentId === liveTipPaymentId) {
                        foundPayment = storedPayment;
                        foundPayment.localId = localId;
                        matchMethod = 'liveTipPaymentId';
                        break;
                    }
                }
            }
            
            // Método 3: Match por userName (sender)
            if (!foundPayment && sender) {
                for (let [localId, storedPayment] of payments.entries()) {
                    if (storedPayment.userName === sender && storedPayment.status === 'pending') {
                        foundPayment = storedPayment;
                        foundPayment.localId = localId;
                        matchMethod = 'userName';
                        break;
                    }
                }
            }
            
            if (foundPayment) {
                // Atualizar status do pagamento
                const oldStatus = foundPayment.status;
                foundPayment.status = paid ? 'confirmed' : 'pending';
                foundPayment.liveTipPaymentId = liveTipPaymentId;
                foundPayment.webhookReceived = true;
                foundPayment.updatedAt = new Date().toISOString();
                foundPayment.liveTipData = payment;
                
                // Atualizar no Map
                payments.set(foundPayment.localId, foundPayment);
                
                console.log(`✅ Pagamento atualizado:
                    🆔 Local ID: ${foundPayment.localId}
                    🔍 Match: ${matchMethod}
                    📊 Status: ${oldStatus} → ${foundPayment.status}
                    👤 User: ${foundPayment.userName}
                    💰 Amount: ${foundPayment.amount}`);
            } else {
                console.log('⚠️ Pagamento não encontrado nos registros locais');
            }
        }

        // Log webhook
        const logEntry = {
            id: generateUuid(),
            timestamp: new Date().toISOString(),
            type: 'webhook',
            event: event || 'payment_notification',
            status: 'processed',
            data: JSON.stringify(req.body),
            ip: req.headers['x-forwarded-for'] || 'unknown',
            processedPayment: foundPayment ? foundPayment.localId : null
        };
        
        webhookLogs.push(logEntry);
        if (webhookLogs.length > 100) {
            webhookLogs.shift();
        }

        return res.status(200).json({ 
            success: true, 
            message: foundPayment ? '🎉 Pagamento confirmado com sucesso!' : '📝 Webhook processado',
            received: req.body,
            processed: !!foundPayment,
            timestamp: new Date().toISOString(),
            logId: logEntry.id
        });
    }
      if (url === '/health' && method === 'GET') {
        return res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            payments: payments.size,
            webhookLogs: webhookLogs.length,
            uptime: process.uptime ? Math.floor(process.uptime()) : 'N/A',
            environment: 'production',
            features: {
                pixPayments: true,
                bitcoinPayments: true,
                liveTipIntegration: true,
                fallbackSystem: true,
                webhookMonitoring: true
            }
        });
    }        // Get payments history endpoint
    if (url === '/payments' && method === 'GET') {
        const paymentsArray = Array.from(payments.values());
        return res.status(200).json({
            success: true,
            payments: paymentsArray,
            total: paymentsArray.length
        });
    }

    // Get webhook logs endpoint
    if (url === '/webhook-logs' && method === 'GET') {
        const limit = parseInt(req.query?.limit) || 50;
        const logs = webhookLogs.slice(-limit).reverse();
        return res.status(200).json({
            success: true,
            logs: logs,
            total: webhookLogs.length
        });
    }

    // Get webhook stats endpoint
    if (url === '/webhook-stats' && method === 'GET') {
        const paymentsArray = Array.from(payments.values());
        const paymentStats = {
            pending: paymentsArray.filter(p => p.status === 'pending').length,
            completed: paymentsArray.filter(p => p.status === 'completed').length,
            failed: paymentsArray.filter(p => p.status === 'failed').length
        };

        return res.status(200).json({
            success: true,
            totalWebhooks: webhookLogs.length,
            totalPayments: paymentsArray.length,
            paymentStats: paymentStats,
            lastWebhook: webhookLogs.length > 0 ? webhookLogs[webhookLogs.length - 1] : null        });
    }

    // Test webhook endpoint
    if (url === '/test-webhook' && method === 'POST') {
        try {
            const testData = req.body || {
                event: 'test_webhook',
                payment: {
                    sender: 'Test User',
                    content: 'Test webhook from monitor',
                    amount: 100,
                    currency: 'BTC',
                    timestamp: new Date().toISOString(),
                    paid: true,
                    paymentId: `test_${Date.now()}`,
                    read: false
                }
            };

            // Add to webhook logs
            const logEntry = {
                id: generateUUID(),
                timestamp: new Date().toISOString(),
                event: testData.event || 'test_webhook',
                status: 'success',
                data: JSON.stringify(testData)
            };
            webhookLogs.push(logEntry);

            console.log('Test webhook processed:', testData);

            return res.status(200).json({
                success: true,
                message: 'Test webhook processed successfully',
                data: testData
            });
        } catch (error) {
            console.error('Test webhook error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to process test webhook'
            });
        }
    }    // Payment generation endpoint - based on working server.js
    if (url === '/generate-qr' && method === 'POST') {
        try {
            console.log('🔍 Recebida requisição para gerar QR Code');
            const { userName, paymentMethod, amount, uniqueId } = req.body;
            
            if (!userName || !paymentMethod || !amount) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Nome do usuário, método de pagamento e valor são obrigatórios' 
                });
            }

            if (amount <= 0) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Valor deve ser maior que zero' 
                });
            }

            // Generate unique ID for local payment
            const externalId = uniqueId || generateUuid();
            
            // Detailed logging
            if (paymentMethod === 'bitcoin') {
                console.log(`⚡ Creating Bitcoin payment:
                    👤 Nome: ${userName}
                    💰 Satoshis: ${amount}
                    🔑 ID Único: ${uniqueId}
                    🆔 Payment ID: ${externalId}`);
            } else {
                console.log(`🏦 Creating PIX payment:
                    👤 Nome: ${userName}
                    💰 Valor: R$ ${amount}
                    🆔 Payment ID: ${externalId}`);
            }

            let paymentData;            if (paymentMethod === 'pix') {
                // Validação PIX seguindo melhores práticas bancárias
                const validation = validatePixPayment(amount, userName);
                
                if (!validation.isValid) {
                    console.log('❌ Validação PIX falhou:', validation.errors);
                    return res.status(400).json({
                        success: false,
                        error: 'Dados PIX inválidos',
                        details: validation.errors,
                        allowedAmounts: PIX_CONFIG.allowedAmounts
                    });
                }
                
                // Usar dados validados e sanitizados
                userName = validation.sanitizedName;
                amount = validation.validatedAmount;
                
                console.log('✅ Validação PIX passou - processando pagamento oficial');
                
                // Try LiveTip API first
                try {
                    const result = await callLiveTipAPI(paymentMethod, userName, amount, externalId);                      // Gerar QR Code usando nosso módulo com fallback
                      const qrCodeImage = await qrCodeGenerator.generateWithLogo(result.code, 'pix');
                      console.log('✅ QR Code PIX gerado com sucesso');
                      
                      paymentData = {
                        id: externalId,
                        liveTipPaymentId: result.id,
                        userName,
                        method: 'pix',
                        amount,
                        status: 'pending',
                        pixCode: result.code,
                        qrCodeImage: qrCodeImage,
                        source: result.source || 'livetip-api-v10',
                        apiVersion: '10',
                        endpoint: '/api/v1/message/10',
                        pixType: result.type || 'emv',
                        createdAt: new Date().toISOString()
                    };

                    console.log('✅ PIX payment created via LiveTip API v10 (Official Endpoint)');

                } catch (apiError) {
                    console.log('⚠️ LiveTip API failed, using PIX fallback:', apiError.message);
                    
                    // Fallback: generate PIX locally
                    const pixCode = generatePixCode(amount, `Pagamento ${userName}`, externalId);
                      // Gerar QR Code usando nosso módulo com fallback
                    const qrCodeImage = await qrCodeGenerator.generateWithLogo(pixCode, 'pix');
                    console.log('✅ QR Code PIX fallback gerado com sucesso');
                    
                    paymentData = {
                        id: externalId,
                        userName,
                        method: 'pix',
                        amount,
                        status: 'pending',
                        pixCode: pixCode,
                        qrCodeImage: qrCodeImage,
                        source: 'fallback-local',
                        createdAt: new Date().toISOString()
                    };

                    console.log('✅ PIX payment created locally');
                }

            } else if (paymentMethod === 'bitcoin') {
                // Validate minimum value in satoshis (100 sats)
                if (amount < 100) {
                    return res.status(400).json({
                        success: false,
                        error: 'Valor mínimo para Bitcoin é 100 satoshis'
                    });
                }

                try {
                    // Try LiveTip API for Bitcoin
                    const result = await callLiveTipAPI(paymentMethod, userName, amount, externalId);
                      // Gerar QR Code Bitcoin usando nosso módulo com fallback
                    const qrCodeImage = await qrCodeGenerator.generateWithLogo(result.code, 'bitcoin');
                    console.log('✅ QR Code Bitcoin gerado com sucesso');
                    
                    paymentData = {
                        id: externalId,
                        liveTipPaymentId: result.id,
                        userName,
                        method: 'bitcoin',
                        amount,
                        satoshis: amount,
                        uniqueId: uniqueId,
                        status: 'pending',
                        lightningInvoice: result.code,
                        qrCodeImage: qrCodeImage,
                        source: 'livetip',
                        createdAt: new Date().toISOString()
                    };

                    console.log(`✅ Bitcoin payment created via LiveTip API - ${amount} satoshis - ID: ${uniqueId}`);

                } catch (apiError) {
                    console.log('⚠️ LiveTip API failed, using Bitcoin fallback:', apiError.message);
                    
                    // Fallback: generate Bitcoin URI locally
                    const bitcoinAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
                    const bitcoinUri = `bitcoin:${bitcoinAddress}?amount=${(amount / 100000000).toFixed(8)}&label=${encodeURIComponent(`Pagamento ${userName}`)}`;
                      // Gerar QR Code Bitcoin fallback usando nosso módulo com fallback
                    const qrCodeImage = await qrCodeGenerator.generateWithLogo(bitcoinUri, 'bitcoin');
                    console.log('✅ QR Code Bitcoin fallback gerado com sucesso');
                    
                    paymentData = {
                        id: externalId,
                        userName,
                        method: 'bitcoin',
                        amount,
                        satoshis: amount,
                        uniqueId: uniqueId,
                        status: 'pending',
                        bitcoinUri: bitcoinUri,
                        bitcoinAddress: bitcoinAddress,
                        qrCodeImage: qrCodeImage,
                        source: 'fallback-local',
                        createdAt: new Date().toISOString()
                    };

                    console.log(`✅ Bitcoin payment created locally - ${amount} satoshis - ID: ${uniqueId}`);
                }
            }

            // Store payment
            payments.set(externalId, paymentData);

            // Response in format expected by frontend
            return res.status(200).json({
                success: true,
                data: {
                    paymentId: externalId,
                    userName: userName,
                    amount: amount,
                    satoshis: paymentMethod === 'bitcoin' ? amount : undefined,
                    uniqueId: uniqueId,
                    method: paymentMethod,
                    qrCodeText: paymentData.lightningInvoice || paymentData.bitcoinUri || paymentData.pixCode,
                    qrCodeImage: paymentData.qrCodeImage,
                    lightningInvoice: paymentData.lightningInvoice,
                    bitcoinUri: paymentData.bitcoinUri,
                    bitcoinAddress: paymentData.bitcoinAddress,
                    pixCode: paymentData.pixCode,
                    source: paymentData.source,
                    createdAt: paymentData.createdAt
                }
            });        } catch (error) {
            console.error('❌ Error generating QR Code:', error.message);
            return res.status(500).json({ 
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Payment status endpoint for automated confirmation system
    if (url.startsWith('/payment-status/') && method === 'GET') {
        const paymentId = url.split('/payment-status/')[1];
        
        if (!paymentId) {
            return res.status(400).json({
                success: false,
                error: 'ID do pagamento é obrigatório'
            });
        }

        console.log(`🔍 Verificando status do pagamento: ${paymentId}`);

        // Buscar pagamento no Map de pagamentos
        const payment = payments.get(paymentId);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Pagamento não encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                paymentId: paymentId,
                status: payment.status || 'pending',
                userName: payment.userName,
                amount: payment.amount,
                method: payment.method,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt || payment.createdAt,
                liveTipPaymentId: payment.liveTipPaymentId,
                webhookReceived: payment.webhookReceived || false            }
        });
    }
    
    // 404 for unknown routes
    res.status(404).json({
        error: 'Route not found',
        availableRoutes: [
            'GET /',
            'GET /control', 
            'GET /webhook-monitor',
            'GET /webhook',
            'POST /webhook',
            'GET /health',
            'POST /generate-qr',
            'GET /payment-status/{paymentId}',
            'GET /payments',
            'GET /webhook-logs',
            'GET /webhook-stats'
        ]
    });
};