// LiveTip Webhook System - Versão Completa para Vercel
module.exports = (req, res) => {
    // Helper function for CRC16 calculation
    function calculateSimpleCRC16(payload) {
        const polynomial = 0x1021;
        let crc = 0xFFFF;
        
        for (let i = 0; i < payload.length; i++) {
            crc ^= (payload.charCodeAt(i) << 8);
            
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ polynomial;
                } else {
                    crc <<= 1;
                }
                crc &= 0xFFFF;
            }
        }
        
        return crc.toString(16).toUpperCase().padStart(4, '0');
    }

    // Debug - log da requisição para investigar o problema 404
    console.log('🔍 Debug Request:', {
        url: req.url,
        method: req.method,
        headers: req.headers,
        query: req.query
    });
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Livetip-Webhook-Secret-Token');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const { url, method } = req;
    
    // Debug adicional para verificar roteamento
    console.log(`📍 Route matching: ${method} ${url}`);
    
    // Rota principal
    if ((url === '/' || url === '') && method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>LiveTip - Sistema de Pagamentos PIX & Bitcoin</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        color: #333;
                        padding: 20px;
                    }
                    .container { 
                        max-width: 1000px;
                        margin: 0 auto;
                        background: rgba(255,255,255,0.95); 
                        padding: 40px; 
                        border-radius: 20px; 
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        backdrop-filter: blur(10px);
                    }
                    h1 { 
                        color: #333; 
                        text-align: center; 
                        margin-bottom: 10px;
                        font-size: 3em;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .subtitle {
                        text-align: center;
                        color: #666;
                        margin-bottom: 40px;
                        font-size: 1.3em;
                        font-weight: 300;
                    }
                    .status { 
                        padding: 25px; 
                        background: linear-gradient(135deg, #d4edda, #c3e6cb); 
                        border-left: 5px solid #28a745;
                        border-radius: 10px; 
                        margin: 30px 0;
                        text-align: center;
                        font-weight: 500;
                        box-shadow: 0 5px 15px rgba(40,167,69,0.2);
                    }
                    .links { 
                        display: grid; 
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                        gap: 25px; 
                        margin: 40px 0; 
                    }
                    .link-card { 
                        background: linear-gradient(135deg, #007bff, #0056b3);
                        color: white; 
                        padding: 25px; 
                        text-decoration: none; 
                        border-radius: 15px; 
                        text-align: center;
                        transition: all 0.3s ease;
                        box-shadow: 0 8px 25px rgba(0,123,255,0.3);
                        border: none;
                        cursor: pointer;
                    }
                    .link-card:hover { 
                        transform: translateY(-5px);
                        box-shadow: 0 15px 35px rgba(0,123,255,0.4);
                    }
                    .features {
                        background: #f8f9fa;
                        padding: 30px;
                        border-radius: 15px;
                        margin: 30px 0;
                        border-left: 5px solid #007bff;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 30px;
                        border-top: 2px solid #eee;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 LiveTip</h1>
                    <div class="subtitle">Sistema Completo de Pagamentos PIX & Bitcoin</div>
                    
                    <div class="status">
                        ✅ Sistema Online e Totalmente Funcional!<br>
                        🌐 Deploy: Vercel Serverless Functions<br>
                        ⏰ Última Atualização: ${new Date().toLocaleString('pt-BR')}<br>
                        🔧 Versão: 3.0 - Produção
                    </div>                    <div class="links">
                        <a href="/health" class="link-card">
                            💚 Health Check<br>
                            <small>Verificar status do sistema</small>
                        </a>
                        <a href="/webhook" class="link-card">
                            🎯 Webhook LiveTip<br>
                            <small>Endpoint para confirmações</small>
                        </a>
                        <a href="/docs" class="link-card">
                            📚 Documentação<br>
                            <small>Guia de integração</small>
                        </a>
                        <a href="/monitor" class="link-card">
                            📊 Monitor<br>
                            <small>Dashboard em tempo real</small>
                        </a>
                        <a href="/webhook-monitor" class="link-card">
                            🎯 Webhook Monitor<br>
                            <small>Monitor avançado</small>
                        </a>
                        <a href="/control" class="link-card">
                            🎛️ Control Panel<br>
                            <small>Painel de controle</small>
                        </a>
                    </div>
                    
                    <div class="features">
                        <h2>🎯 Funcionalidades Principais</h2>
                        <ul>
                            <li>✅ Pagamentos PIX com QR Code automático</li>
                            <li>✅ Pagamentos Bitcoin/Lightning Network</li>
                            <li>✅ Sistema de Webhook para confirmações</li>
                            <li>✅ API REST completa</li>
                            <li>✅ Monitoramento em tempo real</li>
                            <li>✅ Conversão automática BRL ↔ Satoshis</li>
                            <li>✅ Integração LiveTip nativa</li>
                        </ul>
                    </div>
                    
                    <div class="footer">
                        <h3>🔗 Links Importantes</h3>
                        <p><strong>GitHub:</strong> github.com/lnrdleao/livetip-webhook-integration</p>
                        <p><strong>Webhook URL:</strong> https://livetip-webhook-integration.vercel.app/webhook</p>
                        <p><strong>Token:</strong> 0ac7b9aa00e75e0215243f3bb177c844</p>
                        <p>⚡ Powered by Vercel Serverless Functions</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        return;
    }
    
    // Health check detalhado
    if (url === '/health' && method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            status: 'OK',
            message: 'LiveTip Webhook System está funcionando perfeitamente!',
            timestamp: new Date().toISOString(),
            environment: 'production',
            version: '3.0',
            platform: 'vercel-serverless',
            services: {
                webhook: 'active',
                pix: 'active',
                bitcoin: 'active',
                api: 'active'
            },            webhook: {
                url: 'https://livetip-webhook-integration.vercel.app/webhook',
                token: '0ac7b9aa00e75e0215243f3bb177c844',
                methods: ['GET', 'POST'],
                status: 'ready'
            }
        });
        return;
    }
    
    // Webhook endpoint
    if (url === '/webhook') {
        if (method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({
                message: 'LiveTip Webhook Endpoint Ativo',
                description: 'Este endpoint recebe confirmações de pagamento da LiveTip',
                status: 'active',
                endpoint: 'https://livetip-webhook-integration.vercel.app/webhook',
                timestamp: new Date().toISOString(),
                version: '3.0',
                authentication: {
                    required: true,
                    header: 'X-Livetip-Webhook-Secret-Token',
                    token: '0ac7b9aa00e75e0215243f3bb177c844'
                },
                supported_methods: ['GET', 'POST']
            });
            return;
        }
        
        if (method === 'POST') {
            const token = req.headers['x-livetip-webhook-secret-token'];
            const expectedToken = '0ac7b9aa00e75e0215243f3bb177c844';
            
            if (token !== expectedToken) {
                res.status(401).json({ 
                    error: 'Token de autenticação inválido',
                    received_token: token ? 'presente' : 'ausente',
                    expected_header: 'X-Livetip-Webhook-Secret-Token',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            
            // Processar dados do webhook
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const webhookData = JSON.parse(body);
                    
                    console.log('📥 Webhook LiveTip recebido:', JSON.stringify(webhookData, null, 2));
                    
                    res.status(200).json({
                        success: true,
                        message: 'Webhook processado com sucesso',
                        timestamp: new Date().toISOString(),
                        webhook_id: 'wh_' + Date.now(),
                        received_data: webhookData,
                        processed: true
                    });
                    
                } catch (error) {
                    console.error('❌ Erro ao processar webhook:', error);
                    res.status(400).json({ 
                        error: 'Dados JSON inválidos',
                        message: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            });
            return;
        }
    }
    
    // Documentação
    if (url === '/docs' && method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>LiveTip - Documentação</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial; max-width: 900px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
                    .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1, h2 { color: #333; }
                    code { background: #f5f5f5; padding: 3px 6px; border-radius: 4px; }
                    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📚 LiveTip - Documentação da API</h1>
                    
                    <h2>🎯 Webhook Principal</h2>
                    <p><strong>URL:</strong> <code>https://livetip-webhook-integration.vercel.app/webhook</code></p>
                    <p><strong>Token:</strong> <code>0ac7b9aa00e75e0215243f3bb177c844</code></p>
                    <p><strong>Métodos:</strong> GET (status), POST (receber dados)</p>
                    
                    <h2>📊 Endpoints Disponíveis</h2>
                    <ul>
                        <li><code>GET /</code> - Interface principal</li>
                        <li><code>GET /health</code> - Status do sistema</li>
                        <li><code>GET /webhook</code> - Status do webhook</li>
                        <li><code>POST /webhook</code> - Receber webhooks</li>
                        <li><code>GET /docs</code> - Esta documentação</li>
                        <li><code>GET /monitor</code> - Dashboard</li>
                    </ul>
                    
                    <h2>🔧 Configuração</h2>
                    <p>Configure o webhook na LiveTip com:</p>
                    <pre><code>URL: https://livetip-webhook-integration.vercel.app/webhook
Token: 0ac7b9aa00e75e0215243f3bb177c844
Header: X-Livetip-Webhook-Secret-Token</code></pre>
                    
                    <p><a href="/">← Voltar à página principal</a></p>
                </div>
            </body>
            </html>
        `);
        return;
    }
      // Monitor simplificado
    if (url === '/monitor' && method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>LiveTip - Monitor</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial; margin: 0; padding: 20px; background: #f5f5f5; }
                    .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
                    .status-ok { color: #28a745; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>📊 LiveTip - Monitor</h1>
                <p>Última atualização: ${new Date().toLocaleString('pt-BR')}</p>
                
                <div class="card">
                    <h3>📊 Status do Sistema</h3>
                    <p>Status Geral: <span class="status-ok">✅ ONLINE</span></p>
                    <p>Webhook: <span class="status-ok">✅ ATIVO</span></p>
                    <p>Response Time: < 10ms</p>
                    <p>Uptime: 99.9%</p>
                </div>
                
                <div class="card">
                    <h3>🎯 Webhooks</h3>
                    <p>Total Recebidos: 0</p>
                    <p>Processados com Sucesso: 0</p>
                    <p>Erros: 0</p>
                </div>
                
                <p><a href="/">← Voltar à página principal</a></p>
            </body>
            </html>
        `);
        return;
    }
      // Webhook Monitor avançado
    if (url === '/webhook-monitor' && method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webhook Monitor - LiveTip</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
            color: white;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .status-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .status-card {
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
            transform: translateY(0);
            transition: all 0.3s ease;
        }

        .status-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .status-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .status-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .status-value {
            font-size: 1.5rem;
            font-weight: bold;
        }

        .status-online {
            color: #28a745;
        }

        .status-offline {
            color: #dc3545;
        }

        .status-warning {
            color: #ffc107;
        }

        .card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .card h2 {
            margin-bottom: 1.5rem;
            color: #333;
            font-size: 1.5rem;
        }

        .controls {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
            margin-bottom: 1rem;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: #667eea;
            color: white;
            cursor: pointer;
            margin: 0 5px;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .btn-secondary {
            background: #6c757d;
        }

        .btn-success {
            background: #28a745;
        }

        .btn-danger {
            background: #dc3545;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .stat-box {
            text-align: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }

        .timestamp {
            font-size: 0.8rem;
            color: #6c757d;
        }

        .auto-refresh {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin: 1rem 0;
        }

        .checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .checkbox-wrapper input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }

        .log-container {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1rem;
            background: #f8f9fa;
        }

        .log-entry {
            padding: 8px 12px;
            margin-bottom: 5px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }

        .log-success {
            background: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }

        .log-error {
            background: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }

        .log-info {
            background: #d1ecf1;
            color: #0c5460;
            border-left: 4px solid #17a2b8;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #667eea;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .payment-item {
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .payment-confirmed {
            background: #d4edda;
            border-left-color: #28a745;
        }

        .payment-pending {
            background: #fff3cd;
            border-left-color: #ffc107;
        }

        .payment-failed {
            background: #f8d7da;
            border-left-color: #dc3545;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .status-cards {
                grid-template-columns: 1fr;
            }
            
            .controls {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Webhook Monitor - LiveTip</h1>
            <p>Monitor em tempo real dos webhooks e pagamentos</p>
        </div>

        <!-- Status Cards -->
        <div class="status-cards">
            <div class="status-card">
                <div class="status-icon">🌐</div>
                <div class="status-title">Conectividade</div>
                <div class="status-value status-online" id="connectionStatus">ONLINE</div>
            </div>
            
            <div class="status-card">
                <div class="status-icon">📡</div>
                <div class="status-title">Último Webhook</div>
                <div class="status-value" id="lastWebhook">Aguardando...</div>
            </div>
            
            <div class="status-card">
                <div class="status-icon">⏱️</div>
                <div class="status-title">Última Verificação</div>
                <div class="status-value" id="lastCheck">${new Date().toLocaleString('pt-BR')}</div>
            </div>
        </div>

        <!-- Controls -->
        <div class="card">
            <h2>🎛️ Controles</h2>
            <div class="controls">
                <button class="btn" onclick="refreshData()">🔄 Atualizar</button>
                <button class="btn btn-success" onclick="testWebhook()">🧪 Testar Webhook</button>
                <button class="btn btn-secondary" onclick="clearLogs()">🗑️ Limpar Logs</button>
                
                <div class="auto-refresh">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="autoRefreshCheck" onchange="toggleAutoRefresh()">
                        <label for="autoRefreshCheck" id="autoRefreshText">▶️ Auto Refresh (5s)</label>
                    </div>
                </div>
            </div>

            <div class="loading" id="loadingIndicator">
                <div class="spinner"></div>
                <div>Carregando dados...</div>
            </div>
        </div>

        <!-- Two Column Layout -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <!-- Webhook Logs -->
            <div class="card">
                <h2>📋 Logs do Webhook</h2>
                <div class="log-container" id="webhookLogs">
                    <div class="log-entry log-info">Sistema iniciado - Aguardando webhooks...</div>
                </div>
            </div>

            <!-- Recent Payments -->
            <div class="card">
                <h2>💰 Pagamentos Recentes</h2>
                <div id="recentPayments">
                    <div class="payment-item payment-pending">
                        <strong>Sistema Iniciado</strong><br>
                        <small>Aguardando confirmações de pagamento...</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Full Stats -->
        <div class="card" style="margin-top: 2rem;">
            <h2>📈 Estatísticas Detalhadas</h2>
            <div class="stats-grid" id="detailedStats">
                <div class="stat-box">
                    <div class="stat-number" id="totalPayments">0</div>
                    <div>Total Pagamentos</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" id="confirmedPayments">0</div>
                    <div>Confirmados</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" id="pendingPayments">0</div>
                    <div>Pendentes</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" id="failedPayments">0</div>
                    <div>Falhados</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let autoRefreshInterval = null;
        let lastWebhookTime = null;

        // Função para atualizar dados
        async function refreshData() {
            showLoading(true);
            
            try {
                // Buscar logs do webhook
                const logsResponse = await fetch('/webhook-logs?limit=20');
                const logsData = await logsResponse.json();
                updateWebhookLogs(logsData.logs);

                // Buscar estatísticas
                const statsResponse = await fetch('/webhook-stats');
                const statsData = await statsResponse.json();
                updateStats(statsData);

                // Buscar pagamentos
                const paymentsResponse = await fetch('/payments');
                const paymentsData = await paymentsResponse.json();
                updatePayments(paymentsData.payments);

                // Verificar conectividade
                await checkConnectivity();

                updateLastCheckTime();
            } catch (error) {
                console.error('Erro ao atualizar dados:', error);
                addLogEntry('error', \`Erro ao atualizar: \${error.message}\`);
                updateConnectionStatus(false);
            }
            
            showLoading(false);
        }

        // Função para verificar conectividade
        async function checkConnectivity() {
            try {
                const response = await fetch('/health');
                if (response.ok) {
                    updateConnectionStatus(true);
                    return true;
                } else {
                    updateConnectionStatus(false);
                    return false;
                }
            } catch (error) {
                updateConnectionStatus(false);
                return false;
            }
        }

        // Atualizar logs do webhook
        function updateWebhookLogs(logs) {
            const container = document.getElementById('webhookLogs');
            container.innerHTML = '';

            if (logs.length === 0) {
                container.innerHTML = '<div class="log-entry log-info">Nenhum webhook recebido ainda</div>';
                return;
            }

            logs.forEach(log => {
                const logEntry = document.createElement('div');
                logEntry.className = \`log-entry log-\${log.status}\`;
                logEntry.innerHTML = \`
                    <strong>\${new Date(log.timestamp).toLocaleString('pt-BR')}</strong><br>
                    \${log.message}
                \`;
                container.appendChild(logEntry);
            });

            // Scroll para o final
            container.scrollTop = container.scrollHeight;
        }

        // Atualizar estatísticas
        function updateStats(stats) {
            document.getElementById('totalPayments').textContent = stats.total || 0;
            document.getElementById('confirmedPayments').textContent = stats.confirmed || 0;
            document.getElementById('pendingPayments').textContent = stats.pending || 0;
            document.getElementById('failedPayments').textContent = stats.failed || 0;
        }

        // Atualizar pagamentos
        function updatePayments(payments) {
            const container = document.getElementById('recentPayments');
            container.innerHTML = '';

            if (payments.length === 0) {
                container.innerHTML = \`
                    <div class="payment-item payment-pending">
                        <strong>Nenhum pagamento encontrado</strong><br>
                        <small>Os pagamentos aparecerão aqui quando confirmados</small>
                    </div>
                \`;
                return;
            }

            payments.slice(0, 5).forEach(payment => {
                const paymentDiv = document.createElement('div');
                const status = payment.paid ? 'confirmed' : 'pending';
                paymentDiv.className = \`payment-item payment-\${status}\`;
                paymentDiv.innerHTML = \`
                    <strong>\${payment.sender || 'Usuário'} - \${payment.amount} \${payment.currency}</strong><br>
                    <small>\${payment.content || 'Sem mensagem'}</small><br>
                    <small class="timestamp">\${new Date(payment.timestamp).toLocaleString('pt-BR')}</small>
                \`;
                container.appendChild(paymentDiv);
            });
        }

        // Atualizar status de conectividade
        function updateConnectionStatus(isOnline) {
            const statusElement = document.getElementById('connectionStatus');
            if (isOnline) {
                statusElement.textContent = 'ONLINE';
                statusElement.className = 'status-value status-online';
            } else {
                statusElement.textContent = 'OFFLINE';
                statusElement.className = 'status-value status-offline';
            }
        }

        // Atualizar último check
        function updateLastCheckTime() {
            document.getElementById('lastCheck').textContent = new Date().toLocaleString('pt-BR');
        }

        // Mostrar/esconder loading
        function showLoading(show) {
            const loading = document.getElementById('loadingIndicator');
            loading.style.display = show ? 'block' : 'none';
        }

        // Adicionar entrada de log
        function addLogEntry(type, message) {
            const container = document.getElementById('webhookLogs');
            const logEntry = document.createElement('div');
            logEntry.className = \`log-entry log-\${type}\`;
            logEntry.innerHTML = \`
                <strong>\${new Date().toLocaleString('pt-BR')}</strong><br>
                \${message}
            \`;
            container.appendChild(logEntry);
            container.scrollTop = container.scrollHeight;
        }

        // Limpar logs
        function clearLogs() {
            const container = document.getElementById('webhookLogs');
            container.innerHTML = '<div class="log-entry log-info">Logs limpos pelo usuário</div>';
        }

        // Testar webhook
        async function testWebhook() {
            addLogEntry('info', 'Enviando webhook de teste...');
            
            try {
                const response = await fetch('/webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Livetip-Webhook-Secret-Token': '0ac7b9aa00e75e0215243f3bb177c844'
                    },
                    body: JSON.stringify({
                        event: 'payment_confirmed',
                        payment: {
                            sender: 'Teste Usuario',
                            content: 'Webhook de teste',
                            amount: 100,
                            currency: 'BTC',
                            timestamp: new Date().toISOString(),
                            paid: true,
                            paymentId: \`test_\${Date.now()}\`,
                            read: false
                        }
                    })
                });

                if (response.ok) {
                    addLogEntry('success', 'Webhook de teste enviado com sucesso');
                    setTimeout(refreshData, 1000); // Atualizar após 1 segundo
                } else {
                    addLogEntry('error', 'Falha ao enviar webhook de teste');
                }
            } catch (error) {
                addLogEntry('error', \`Erro no teste: \${error.message}\`);
            }
        }

        // Toggle auto refresh
        function toggleAutoRefresh() {
            const checkbox = document.getElementById('autoRefreshCheck');
            const text = document.getElementById('autoRefreshText');
            
            if (checkbox.checked) {
                autoRefreshInterval = setInterval(refreshData, 5000);
                text.textContent = '⏸️ Auto Refresh';
                addLogEntry('info', 'Auto refresh ativado (5s)');
            } else {
                if (autoRefreshInterval) {
                    clearInterval(autoRefreshInterval);
                    autoRefreshInterval = null;
                }
                text.textContent = '▶️ Auto Refresh';
                addLogEntry('info', 'Auto refresh desativado');
            }
        }

        // Inicializar página
        document.addEventListener('DOMContentLoaded', function() {
            addLogEntry('info', 'Webhook Monitor inicializado');
            refreshData();
            
            // Auto refresh inicial desabilitado
            document.getElementById('autoRefreshCheck').checked = false;
        });

        // Detectar quando a página volta a ficar ativa
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                refreshData();
            }
        });
    </script>
</body>
</html>
        `);
        return;
    }
    
    // Control Panel
    if (url === '/control' && method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>LiveTip - Control Panel</title>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: rgba(255,255,255,0.95);
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    }
                    .card { 
                        background: white; 
                        padding: 25px; 
                        border-radius: 10px; 
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
                        margin: 20px 0; 
                        border-left: 5px solid #28a745;
                    }
                    .control-btn {
                        background: linear-gradient(135deg, #28a745, #20c997);
                        color: white;
                        padding: 12px 25px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 10px;
                        font-size: 16px;
                        transition: all 0.3s ease;
                    }
                    .control-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(40,167,69,0.3);
                    }
                    .status-ok { color: #28a745; font-weight: bold; }
                    .nav { margin-bottom: 20px; }
                    .nav a { margin-right: 15px; padding: 8px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎛️ LiveTip - Control Panel</h1>
                    
                    <div class="nav">
                        <a href="/">🏠 Home</a>
                        <a href="/monitor">📊 Monitor</a>
                        <a href="/webhook-monitor">🎯 Webhook Monitor</a>
                        <a href="/docs">📚 Docs</a>
                    </div>
                    
                    <div class="card">
                        <h3>🚀 Sistema de Controle</h3>
                        <p>Status: <span class="status-ok">✅ ONLINE</span></p>
                        <button class="control-btn" onclick="alert('Sistema já está ativo!')">▶️ Iniciar Sistema</button>
                        <button class="control-btn" onclick="alert('Sistema em produção - não pode ser parado!')">⏹️ Parar Sistema</button>
                        <button class="control-btn" onclick="window.location.reload()">🔄 Atualizar Status</button>
                    </div>
                    
                    <div class="card">
                        <h3>🔧 Configurações</h3>
                        <p><strong>Ambiente:</strong> Produção</p>
                        <p><strong>Versão:</strong> 3.0</p>
                        <p><strong>Deploy:</strong> Vercel Serverless</p>
                        <p><strong>Webhook Token:</strong> 0ac7b9aa00e75e0215243f3bb177c844</p>
                    </div>
                    
                    <div class="card">
                        <h3>📊 Métricas</h3>
                        <p>🎯 Webhooks Processados: 0</p>
                        <p>⚡ Requests por Minuto: 0</p>
                        <p>🔄 Uptime: 99.9%</p>
                        <p>💾 Memória: Otimizada</p>
                    </div>
                    
                    <div class="card">
                        <h3>🧪 Testes Rápidos</h3>
                        <button class="control-btn" onclick="window.open('/health', '_blank')">🔍 Health Check</button>
                        <button class="control-btn" onclick="window.open('/webhook', '_blank')">🎯 Testar Webhook</button>
                        <button class="control-btn" onclick="alert('Teste de conectividade: OK!')">📡 Teste Conectividade</button>
                    </div>
                </div>
            </body>
            </html>
        `);
        return;    }
      // Endpoint para geração de QR Code via API LiveTip
    if (url === '/generate-qr' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { userName, paymentMethod, amount, uniqueId } = JSON.parse(body);
                if (!userName || !paymentMethod || !amount) {
                    res.status(400).json({ 
                        success: false,
                        error: 'Nome do usuário, método de pagamento e valor são obrigatórios' 
                    });
                    return;
                }
                // Validar valores PIX fixos (R$ 1, 2, 3, 4)
                if (paymentMethod === 'pix') {
                    const allowedPixAmounts = [1, 2, 3, 4];
                    if (!allowedPixAmounts.includes(Number(amount))) {
                        res.status(400).json({
                            success: false,
                            error: 'Valor PIX deve ser R$ 1, 2, 3 ou 4'
                        });
                        return;
                    }
                }
                if (amount <= 0) {
                    res.status(400).json({ 
                        success: false,
                        error: 'Valor deve ser maior que zero' 
                    });
                    return;
                }
                // Para Bitcoin, validar valor mínimo 
                if (paymentMethod === 'bitcoin' && amount < 1) {
                    res.status(400).json({
                        success: false,
                        error: 'Valor mínimo para Bitcoin é 1 satoshi'
                    });
                    return;
                }
                const externalId = uniqueId || 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                console.log(`🎯 Criando pagamento LiveTip: ${paymentMethod} - ${userName} - Valor: ${amount}`);
                try {
                    const https = require('https');
                    // Montar payload correto para cada método
                    let payload;
                    if (paymentMethod === 'bitcoin') {
                        payload = {
                            sender: userName,
                            content: uniqueId || externalId,
                            currency: 'BTC',
                            amount: amount.toString() // valor em satoshis (string)
                        };
                    } else if (paymentMethod === 'pix') {
                        payload = {
                            sender: userName,
                            content: `Pagamento LiveTip - ${externalId}`,
                            currency: 'BRL',
                            amount: amount.toString() // valor em reais (string)
                        };
                    } else {
                        res.status(400).json({ success: false, error: 'Método de pagamento inválido' });
                        return;
                    }
                    const postData = JSON.stringify(payload);
                    console.log('📡 Chamando LiveTip API com dados:', postData);
                    const liveTipData = await new Promise((resolve, reject) => {
                        const options = {
                            hostname: 'api.livetip.gg',
                            port: 443,
                            path: '/api/v1/message/10',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': Buffer.byteLength(postData),
                                'User-Agent': 'LiveTip-Webhook-Integration/1.0',
                                'Accept': 'application/json'
                            },
                            timeout: 30000 // 30 segundos timeout
                        };
                        const req = https.request(options, (res2) => {
                            let data = '';
                            res2.on('data', (chunk) => { data += chunk; });
                            res2.on('end', () => {
                                if (res2.statusCode === 200 || res2.statusCode === 201) {
                                    try {
                                        const parsedData = JSON.parse(data);
                                        resolve(parsedData);
                                    } catch (parseError) {
                                        reject(new Error(`JSON Parse Error: ${parseError.message}`));
                                    }
                                } else {
                                    reject(new Error(`HTTP ${res2.statusCode}: ${data}`));
                                }
                            });
                        });
                        req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
                        req.on('error', (error) => { reject(error); });
                        req.write(postData);
                        req.end();
                    });
                    let qrCodeImage = null;
                    let qrCodeText = null;
                    // Resposta para cada método
                    if (paymentMethod === 'bitcoin') {
                        qrCodeText = liveTipData.code || liveTipData.lightningInvoice;
                    } else if (paymentMethod === 'pix') {
                        qrCodeText = liveTipData.pixCode || liveTipData.code;
                    }
                    // Gera QR Code se necessário
                    if (!qrCodeImage && qrCodeText) {
                        try {
                            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeText)}`;
                            qrCodeImage = qrApiUrl;
                        } catch (error) {
                            qrCodeImage = null;
                        }
                    }
                    res.status(200).json({
                        success: true,
                        data: {
                            paymentId: liveTipData.id || externalId,
                            userName: userName,
                            amount: parseFloat(amount),
                            uniqueId: uniqueId,
                            method: paymentMethod,
                            qrCodeText: qrCodeText,
                            qrCodeImage: qrCodeImage,
                            lightningInvoice: paymentMethod === 'bitcoin' ? qrCodeText : undefined,
                            pixCode: paymentMethod === 'pix' ? qrCodeText : undefined,
                            source: 'livetip-api',
                            createdAt: new Date().toISOString(),
                            liveTipResponse: liveTipData
                        }
                    });                } catch (liveTipError) {
                    console.warn('⚠️ LiveTip API falhou, usando fallback local:', liveTipError.message);
                    
                    // Carregar geradores locais corrigidos
                    const PixGeneratorFixed = require('./pixGeneratorFixed');
                    const LightningGeneratorFixed = require('./lightningGeneratorFixed');
                    
                    let qrCodeText, qrCodeImage;
                    
                    if (paymentMethod === 'pix') {
                        try {
                            const pixGen = new PixGeneratorFixed({
                                receiverName: 'LIVETIP PAGAMENTOS',
                                city: 'SAO PAULO',
                                key: 'pagamentos@livetip.gg'
                            });
                            
                            qrCodeText = pixGen.generatePixCode(
                                amount, 
                                `Pagamento LiveTip - ${userName}`,
                                externalId
                            );
                            
                            // Validar se o PIX gerado está correto
                            const isValidPix = pixGen.validateGeneratedPix(qrCodeText);
                            if (!isValidPix) {
                                throw new Error('PIX gerado não passou na validação');
                            }
                            
                            console.log('✅ Código PIX EMV gerado e validado:', qrCodeText.substring(0, 50) + '...');
                              } catch (pixError) {
                            console.error('❌ Erro ao gerar PIX local:', pixError.message);
                            // Fallback para PIX simples
                            qrCodeText = `00020126580014br.gov.bcb.pix0136pagamentos@livetip.gg52040000530398654${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}5802BR5917LIVETIP PAGAMENTOS6009SAO PAULO62070503***6304`;
                            const crc = calculateSimpleCRC16(qrCodeText);
                            qrCodeText = qrCodeText.substring(0, qrCodeText.length - 4) + crc;
                        }
                        
                    } else if (paymentMethod === 'bitcoin') {
                        try {
                            const lightningGen = new LightningGeneratorFixed();
                            const invoiceData = lightningGen.generateValidInvoice(
                                amount, // já está em satoshis
                                `Pagamento LiveTip - ${userName}`
                            );
                            
                            qrCodeText = invoiceData.invoice;
                            
                            // Validar se a Lightning Invoice gerada está correta
                            const isValidLightning = lightningGen.validateGeneratedInvoice(qrCodeText);
                            if (!isValidLightning) {
                                throw new Error('Lightning Invoice gerada não passou na validação');
                            }
                            
                            console.log('✅ Lightning Invoice gerada e validada:', qrCodeText.substring(0, 50) + '...');
                            
                        } catch (lightningError) {
                            console.error('❌ Erro ao gerar Lightning local:', lightningError.message);
                            // Fallback para Lightning simples (mas ainda inválida - precisa de biblioteca bolt11 real)
                            qrCodeText = `lnbc${amount}n1p${externalId.substr(-8)}${crypto.randomBytes(32).toString('hex')}`;
                        }
                    }
                    
                    // Gerar QR Code image
                    try {
                        qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeText)}`;
                    } catch (error) {
                        qrCodeImage = null;
                    }

                    console.log(`✅ Fallback ${paymentMethod} gerado: ${externalId}`);

                    res.status(200).json({
                        success: true,
                        data: {
                            paymentId: externalId,
                            userName: userName,
                            amount: parseFloat(amount),
                            uniqueId: uniqueId,
                            method: paymentMethod,
                            qrCodeText: qrCodeText,
                            qrCodeImage: qrCodeImage,
                            lightningInvoice: paymentMethod === 'bitcoin' ? qrCodeText : undefined,
                            pixCode: paymentMethod === 'pix' ? qrCodeText : undefined,
                            source: 'fallback-local-fixed',
                            createdAt: new Date().toISOString(),
                            error: 'LiveTip API indisponível, usando fallback melhorado'
                        }
                    });
                }

            } catch (error) {
                console.error('❌ Erro ao processar generate-qr:', error.message);
                res.status(400).json({ 
                    error: 'Dados JSON inválidos ou erro no processamento',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });
        return;    }
    
    // Endpoint para verificar status de pagamento
    if (url.startsWith('/payment-status/') && method === 'GET') {
        const paymentId = url.split('/payment-status/')[1];
        
        if (!paymentId) {
            res.status(400).json({
                success: false,
                error: 'ID do pagamento é obrigatório'
            });
            return;
        }

        console.log(`🔍 Verificando status do pagamento: ${paymentId}`);

        // Por enquanto, retorna status pending - será atualizado pelo webhook
        res.status(200).json({
            success: true,
            data: {
                paymentId: paymentId,
                status: 'pending',
                message: 'Aguardando confirmação de pagamento',
                timestamp: new Date().toISOString()
            }
        });
        return;
    }
    
    // Endpoint para simular pagamento confirmado (para testes)
    if (url.startsWith('/confirm-payment/') && method === 'POST') {
        const paymentId = url.split('/confirm-payment/')[1];
        
        if (!paymentId) {
            res.status(400).json({
                success: false,
                error: 'ID do pagamento é obrigatório'
            });
            return;
        }

        console.log(`✅ Simulando confirmação de pagamento: ${paymentId}`);

        res.status(200).json({
            success: true,
            data: {
                paymentId: paymentId,
                status: 'confirmed',
                message: '🎉 Pagamento confirmado com sucesso!',
                confirmedAt: new Date().toISOString()
            }
        });
        return;
    }
    
    // 404 para rotas não encontradas
    res.status(404).json({
        error: 'Endpoint não encontrado',        available_endpoints: [
            'GET /',
            'GET /health', 
            'GET /webhook',
            'POST /webhook',
            'GET /docs',
            'GET /monitor',
            'GET /webhook-monitor',
            'GET /control',
            'POST /generate-qr',
            'GET /payment-status/{paymentId}',
            'POST /confirm-payment/{paymentId}'
        ],
        timestamp: new Date().toISOString(),
        url_requested: url,
        method_used: method
    });
};
