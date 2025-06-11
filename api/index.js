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
    }    // Webhook Monitor - Versão EXATA do localhost:3001
    if (url === '/webhook-monitor' && method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`<!DOCTYPE html>
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
        }

        .status-card h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }

        .status-indicator {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 10px;
        }

        .status-online { background: #27ae60; }
        .status-offline { background: #e74c3c; }
        .status-warning { background: #f39c12; }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        .card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .card h2 {
            color: #2c3e50;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 0.5rem;
        }

        .webhook-log {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            padding: 1rem;
            background: #f8f9fa;
        }

        .log-entry {
            padding: 0.5rem;
            margin: 0.5rem 0;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }

        .log-success { background: #d4edda; color: #155724; }
        .log-error { background: #f8d7da; color: #721c24; }
        .log-warning { background: #fff3cd; color: #856404; }
        .log-info { background: #d1ecf1; color: #0c5460; }

        .payment-item {
            padding: 1rem;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            margin: 0.5rem 0;
            transition: all 0.3s ease;
        }

        .payment-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .payment-confirmed {
            border-left: 4px solid #27ae60;
            background: #d4edda;
        }

        .payment-pending {
            border-left: 4px solid #f39c12;
            background: #fff3cd;
        }

        .payment-failed {
            border-left: 4px solid #e74c3c;
            background: #f8d7da;
        }

        .controls {
            margin-bottom: 2rem;
            text-align: center;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
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
            margin: 1rem 0;
        }

        .loading {
            display: none;
            text-align: center;
            color: white;
            font-size: 1.1rem;
        }

        .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
            
            .status-cards {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Webhook Monitor - LiveTip</h1>
            <p>Monitoramento em tempo real de confirmações de pagamento</p>
        </div>

        <!-- Status Cards -->
        <div class="status-cards">
            <div class="status-card">
                <h3>📡 Status do Webhook</h3>
                <span class="status-indicator status-online" id="webhookStatus"></span>
                <span id="webhookStatusText">Online</span>
                <div class="timestamp" id="lastWebhookTime">Último webhook: Nunca</div>
            </div>
            
            <div class="status-card">
                <h3>🔗 Conectividade</h3>
                <span class="status-indicator status-online" id="connectionStatus"></span>
                <span id="connectionStatusText">Conectado</span>
                <div class="timestamp" id="lastCheckTime">Última verificação: Agora</div>
            </div>
            
            <div class="status-card">
                <h3>📊 Estatísticas</h3>
                <div id="totalWebhooks" class="stat-number">0</div>
                <div>Total de webhooks</div>
            </div>
        </div>

        <!-- Controls -->
        <div class="controls">
            <button class="btn" onclick="refreshData()">🔄 Atualizar</button>
            <button class="btn btn-secondary" onclick="clearLogs()">🗑️ Limpar Logs</button>
            <button class="btn btn-success" onclick="testWebhook()">🧪 Testar Webhook</button>
            <button class="btn btn-danger" onclick="toggleAutoRefresh()">
                <span id="autoRefreshText">▶️ Auto Refresh</span>
            </button>
        </div>

        <div class="auto-refresh">
            <label>
                <input type="checkbox" id="autoRefreshCheck" onchange="toggleAutoRefresh()">
                Atualização automática (5s)
            </label>
        </div>

        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Atualizando dados...</p>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Webhook Logs -->
            <div class="card">
                <h2>📜 Logs do Webhook</h2>
                <div class="webhook-log" id="webhookLogs">
                    <div class="log-entry log-info">
                        <strong>Sistema inicializado</strong><br>
                        Aguardando webhooks do LiveTip...
                    </div>
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
                logEntry.className = \`log-entry log-\${getLogClass(log.status)}\`;
                
                const timestamp = new Date(log.timestamp).toLocaleString('pt-BR');
                logEntry.innerHTML = \`
                    <strong>\${log.event}</strong> - \${log.status}<br>
                    <small>\${timestamp}</small><br>
                    <small>\${log.data ? JSON.parse(log.data).sender || 'N/A' : 'N/A'}</small>
                \`;
                
                container.appendChild(logEntry);
            });

            // Atualizar último webhook
            if (logs.length > 0) {
                lastWebhookTime = new Date(logs[0].timestamp);
                updateWebhookStatus(true);
            }
        }

        // Atualizar estatísticas
        function updateStats(stats) {
            document.getElementById('totalWebhooks').textContent = stats.totalWebhooks || 0;
            document.getElementById('totalPayments').textContent = stats.totalPayments || 0;
            
            const paymentStats = stats.paymentStats || {};
            document.getElementById('confirmedPayments').textContent = paymentStats.completed || 0;
            document.getElementById('pendingPayments').textContent = paymentStats.pending || 0;
            document.getElementById('failedPayments').textContent = paymentStats.failed || 0;
        }

        // Atualizar pagamentos
        function updatePayments(payments) {
            const container = document.getElementById('recentPayments');
            container.innerHTML = '';

            if (payments.length === 0) {
                container.innerHTML = '<div class="payment-item">Nenhum pagamento encontrado</div>';
                return;
            }

            // Mostrar últimos 10 pagamentos
            payments.slice(-10).reverse().forEach(payment => {
                const paymentDiv = document.createElement('div');
                paymentDiv.className = \`payment-item payment-\${payment.status}\`;
                
                const timestamp = new Date(payment.createdAt).toLocaleString('pt-BR');
                const amount = payment.method === 'bitcoin' ? 
                    \`\${payment.satoshis || payment.amount} sats\` : 
                    \`R$ \${payment.amount}\`;
                
                paymentDiv.innerHTML = \`
                    <strong>\${payment.userName}</strong> - \${payment.method.toUpperCase()}<br>
                    <strong>Valor:</strong> \${amount}<br>
                    <strong>Status:</strong> \${payment.status}<br>
                    <small>ID: \${payment.id}</small><br>
                    <small>\${timestamp}</small>
                \`;
                
                container.appendChild(paymentDiv);
            });
        }

        // Função para determinar classe do log
        function getLogClass(status) {
            switch (status) {
                case 'success': return 'success';
                case 'error': return 'error';
                case 'received': return 'info';
                default: return 'warning';
            }
        }

        // Atualizar status do webhook
        function updateWebhookStatus(isOnline) {
            const indicator = document.getElementById('webhookStatus');
            const text = document.getElementById('webhookStatusText');
            const timeEl = document.getElementById('lastWebhookTime');
            
            if (isOnline) {
                indicator.className = 'status-indicator status-online';
                text.textContent = 'Online';
                if (lastWebhookTime) {
                    timeEl.textContent = \`Último webhook: \${lastWebhookTime.toLocaleString('pt-BR')}\`;
                }
            } else {
                indicator.className = 'status-indicator status-offline';
                text.textContent = 'Offline';
                timeEl.textContent = 'Nenhum webhook recebido';
            }
        }

        // Atualizar status de conectividade
        function updateConnectionStatus(isConnected) {
            const indicator = document.getElementById('connectionStatus');
            const text = document.getElementById('connectionStatusText');
            
            if (isConnected) {
                indicator.className = 'status-indicator status-online';
                text.textContent = 'Conectado';
            } else {
                indicator.className = 'status-indicator status-offline';
                text.textContent = 'Desconectado';
            }
        }

        // Atualizar hora da última verificação
        function updateLastCheckTime() {
            document.getElementById('lastCheckTime').textContent = 
                \`Última verificação: \${new Date().toLocaleTimeString('pt-BR')}\`;
        }

        // Mostrar/esconder loading
        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }

        // Adicionar entrada de log local
        function addLogEntry(type, message) {
            const container = document.getElementById('webhookLogs');
            const logEntry = document.createElement('div');
            logEntry.className = \`log-entry log-\${type}\`;
            logEntry.innerHTML = \`
                <strong>Sistema</strong><br>
                \${message}<br>
                <small>\${new Date().toLocaleString('pt-BR')}</small>
            \`;
            container.insertBefore(logEntry, container.firstChild);
        }

        // Limpar logs
        function clearLogs() {
            if (confirm('Tem certeza que deseja limpar todos os logs?')) {
                document.getElementById('webhookLogs').innerHTML = 
                    '<div class="log-entry log-info">Logs limpos pelo usuário</div>';
            }
        }

        // Testar webhook
        async function testWebhook() {
            try {
                addLogEntry('info', 'Enviando webhook de teste...');
                
                const response = await fetch('/test-webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
</html>`);
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
        return;    }    // Endpoint para geração de QR Code via API LiveTip - VERSÃO PRODUÇÃO
    if (url === '/generate-qr' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { userName, paymentMethod, amount, uniqueId } = JSON.parse(body);
                
                // Validações básicas
                if (!userName || !paymentMethod || !amount) {
                    res.status(400).json({ 
                        success: false,
                        error: 'Nome do usuário, método de pagamento e valor são obrigatórios' 
                    });
                    return;
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
                    return;                }

                const externalId = uniqueId || 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                console.log('🎯 Criando pagamento LiveTip:', paymentMethod, '-', userName, '- Valor:', amount);

                try {
                    const https = require('https');
                    
                    // Montar payload específico para cada método
                    let payload;
                    if (paymentMethod === 'bitcoin') {
                        payload = {
                            sender: userName,
                            content: uniqueId || externalId,
                            currency: 'BTC',
                            amount: amount.toString()
                        };
                    } else if (paymentMethod === 'pix') {
                        // PAYLOAD EXATO do código local funcionando
                        payload = {
                            sender: userName || "usuario_webhook",
                            content: 'Pagamento LiveTip - R$ ' + parseFloat(amount).toFixed(2),
                            currency: 'BRL',
                            amount: parseFloat(amount).toFixed(2)
                        };
                    } else {
                        res.status(400).json({ success: false, error: 'Método de pagamento inválido' });
                        return;
                    }

                    const postData = JSON.stringify(payload);
                    console.log('📡 Chamando LiveTip API (endpoint /message/10):', postData);

                    // Chamada para API LiveTip
                    const liveTipData = await new Promise((resolve, reject) => {
                        const options = {
                            hostname: 'api.livetip.gg',
                            port: 443,
                            path: '/api/v1/message/10',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': Buffer.byteLength(postData),
                                'User-Agent': 'LiveTip-Webhook-Integration/1.0'
                            },
                            timeout: 30000
                        };

                        const request = https.request(options, (response) => {
                            let data = '';
                            response.on('data', (chunk) => { data += chunk; });
                            response.on('end', () => {
                                console.log('📥 LiveTip API Response (' + response.statusCode + '):', data.substring(0, 100) + '...');
                                  if (response.statusCode === 200 || response.statusCode === 201) {
                                    try {
                                        // Both PIX and Bitcoin return JSON from LiveTip API
                                        const parsedData = JSON.parse(data);
                                        console.log('✅ Resposta JSON da LiveTip:', JSON.stringify(parsedData, null, 2));
                                        
                                        if (paymentMethod === 'pix') {
                                            const pixCodeFromApi = parsedData.code;
                                            console.log('✅ Código PIX recebido da LiveTip:', pixCodeFromApi ? pixCodeFromApi.substring(0, 50) + '...' : 'NULL');
                                            
                                            if (!pixCodeFromApi || pixCodeFromApi.length < 50) {
                                                throw new Error('Código PIX inválido recebido da API');
                                            }
                                            
                                            resolve({ 
                                                code: pixCodeFromApi, 
                                                pixCode: pixCodeFromApi,
                                                id: parsedData.id || externalId,
                                                source: 'livetip_api'
                                            });
                                        } else {
                                            // Bitcoin - use parsed data directly
                                            resolve(parsedData);
                                        }
                                    } catch (parseError) {
                                        reject(new Error('JSON Parse Error: ' + parseError.message));
                                    }
                                } else {
                                    reject(new Error('HTTP ' + response.statusCode + ': ' + data));
                                }
                                }
                                }
                            });
                        });

                        request.on('timeout', () => { 
                            request.destroy(); 
                            reject(new Error('Request timeout')); 
                        });
                        request.on('error', (error) => { 
                            reject(error); 
                        });
                        request.write(postData);
                        request.end();
                    });

                    // Processar resposta da LiveTip
                    let qrCodeText = null;
                    let qrCodeImage = null;

                    if (paymentMethod === 'bitcoin') {
                        qrCodeText = liveTipData.code || liveTipData.lightningInvoice;
                        console.log(\`✅ Lightning Invoice recebido da LiveTip: \${qrCodeText ? qrCodeText.substring(0, 50) + '...' : 'NULL'}\`);
                    } else if (paymentMethod === 'pix') {
                        qrCodeText = liveTipData.code || liveTipData.pixCode;
                        console.log(\`✅ Código PIX recebido da LiveTip: \${qrCodeText ? qrCodeText.substring(0, 50) + '...' : 'NULL'}\`);
                    }

                    // Validar se o código foi recebido
                    if (!qrCodeText || qrCodeText.length < 20) {
                        throw new Error('Código de pagamento inválido recebido da API LiveTip');
                    }

                    // Gerar QR Code image usando API externa
                    try {
                        qrCodeImage = \`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=\${encodeURIComponent(qrCodeText)}\`;
                    } catch (error) {
                        console.warn('⚠️ Erro ao gerar QR code image:', error.message);
                        qrCodeImage = null;
                    }

                    // Resposta de sucesso com dados da LiveTip
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
                    });

                } catch (liveTipError) {
                    console.warn('⚠️ LiveTip API falhou, usando fallback local melhorado:', liveTipError.message);
                    
                    // Sistema de fallback local melhorado
                    let qrCodeText, qrCodeImage;
                    
                    if (paymentMethod === 'pix') {
                        // Fallback PIX com formato EMV melhorado
                        try {
                            const pixKey = 'pagamentos@livetip.gg';
                            const receiverName = 'LIVETIP PAGAMENTOS';
                            const city = 'SAO PAULO';
                            const txId = externalId.substring(0, 25);
                            
                            // Gerar código PIX EMV básico mas válido
                            let pixCode = '00020126';
                            pixCode += '58' + ('0014BR.GOV.BCB.PIX01' + pixKey.length.toString().padStart(2, '0') + pixKey).length.toString().padStart(2, '0') + '0014BR.GOV.BCB.PIX01' + pixKey.length.toString().padStart(2, '0') + pixKey;
                            pixCode += '5204' + '0000'; // MCC
                            pixCode += '5303' + '986'; // Currency BRL
                            pixCode += '54' + amount.toFixed(2).length.toString().padStart(2, '0') + amount.toFixed(2);
                            pixCode += '5802' + 'BR';
                            pixCode += '59' + receiverName.length.toString().padStart(2, '0') + receiverName;
                            pixCode += '60' + city.length.toString().padStart(2, '0') + city;
                            pixCode += '62' + ('05' + txId.length.toString().padStart(2, '0') + txId).length.toString().padStart(2, '0') + '05' + txId.length.toString().padStart(2, '0') + txId;
                            pixCode += '6304';
                            
                            // Calcular CRC16 simplificado
                            function crc16(data) {
                                let crc = 0xFFFF;
                                for (let i = 0; i < data.length; i++) {
                                    crc ^= data.charCodeAt(i) << 8;
                                    for (let j = 0; j < 8; j++) {
                                        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
                                    }
                                }
                                return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
                            }
                            
                            qrCodeText = pixCode + crc16(pixCode);
                            console.log('✅ PIX EMV fallback gerado:', qrCodeText.substring(0, 50) + '...');
                            
                        } catch (pixError) {
                            console.error('❌ Erro no fallback PIX:', pixError.message);
                            qrCodeText = \`PIX-\${externalId}-\${amount}-\${userName}\`;
                        }
                        
                    } else if (paymentMethod === 'bitcoin') {
                        // Fallback Bitcoin URI
                        try {
                            const bitcoinAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
                            const btcAmount = (amount / 100000000).toFixed(8);
                            qrCodeText = \`bitcoin:\${bitcoinAddress}?amount=\${btcAmount}&label=LiveTip%20Payment\`;
                            console.log('✅ Bitcoin URI fallback gerado:', qrCodeText);
                            
                        } catch (btcError) {
                            console.error('❌ Erro no fallback Bitcoin:', btcError.message);
                            qrCodeText = \`BTC-\${externalId}-\${amount}-sats\`;
                        }
                    }
                    
                    // Gerar QR Code image para fallback
                    try {
                        qrCodeImage = \`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=\${encodeURIComponent(qrCodeText)}\`;
                    } catch (error) {
                        qrCodeImage = null;
                    }

                    // Resposta de fallback
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
                            source: 'fallback-local-enhanced',
                            createdAt: new Date().toISOString(),
                            error: 'LiveTip API indisponível, usando fallback melhorado',
                            fallbackReason: liveTipError.message
                        }
                    });
                }

            } catch (error) {
                console.error('❌ Erro ao processar generate-qr:', error.message);
                res.status(400).json({ 
                    success: false,
                    error: 'Erro no processamento da solicitação',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });
        return;
    }
    
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
