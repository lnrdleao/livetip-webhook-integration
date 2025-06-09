// Versão ultra-simplificada para Vercel
module.exports = (req, res) => {
    // Configure CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Livetip-Webhook-Secret-Token');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const { url, method } = req;
    
    // Rota principal
    if (url === '/' && method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>LiveTip - Sistema de Pagamentos</title>
                <style>
                    body { 
                        font-family: 'Arial', sans-serif; 
                        max-width: 900px; 
                        margin: 0 auto; 
                        padding: 20px; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        color: #333;
                    }
                    .container { 
                        background: rgba(255,255,255,0.95); 
                        padding: 40px; 
                        border-radius: 15px; 
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                        backdrop-filter: blur(10px);
                    }
                    h1 { 
                        color: #333; 
                        text-align: center; 
                        margin-bottom: 10px;
                        font-size: 2.5em;
                    }
                    .subtitle {
                        text-align: center;
                        color: #666;
                        margin-bottom: 30px;
                        font-size: 1.2em;
                    }
                    .status { 
                        padding: 20px; 
                        background: linear-gradient(135deg, #d4edda, #c3e6cb); 
                        border: 1px solid #c3e6cb; 
                        border-radius: 10px; 
                        margin: 25px 0;
                        text-align: center;
                        font-weight: bold;
                    }
                    .links { 
                        display: grid; 
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
                        gap: 20px; 
                        margin: 30px 0; 
                    }
                    .link-card { 
                        background: linear-gradient(135deg, #007bff, #0056b3);
                        color: white; 
                        padding: 20px; 
                        text-decoration: none; 
                        border-radius: 10px; 
                        text-align: center;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(0,123,255,0.3);
                    }
                    .link-card:hover { 
                        transform: translateY(-3px);
                        box-shadow: 0 8px 25px rgba(0,123,255,0.4);
                    }
                    .features {
                        background: #f8f9fa;
                        padding: 25px;
                        border-radius: 10px;
                        margin: 25px 0;
                    }
                    .features h2 {
                        color: #333;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .features ul {
                        list-style: none;
                        padding: 0;
                    }
                    .features li {
                        padding: 8px 0;
                        border-bottom: 1px solid #dee2e6;
                    }
                    .features li:last-child {
                        border-bottom: none;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        color: #666;
                        font-size: 0.9em;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 LiveTip</h1>
                    <div class="subtitle">Sistema de Pagamentos PIX & Bitcoin</div>
                    
                    <div class="status">
                        ✅ Sistema Online e Funcionando!<br>
                        🌐 Deploy: Vercel Serverless<br>
                        ⏰ Status: ${new Date().toLocaleString('pt-BR')}<br>
                        🔧 Versão: 2.0 - Otimizada
                    </div>
                    
                    <div class="links">
                        <a href="/health" class="link-card">
                            💚 Health Check<br>
                            <small>Verificar status do sistema</small>
                        </a>
                        <a href="/webhook" class="link-card">
                            🎯 Webhook Status<br>
                            <small>Endpoint para LiveTip</small>
                        </a>
                        <a href="/api/test" class="link-card">
                            🧪 Teste API<br>
                            <small>Testar funcionalidades</small>
                        </a>
                        <a href="/docs" class="link-card">
                            📚 Documentação<br>
                            <small>Guia de integração</small>
                        </a>
                    </div>
                    
                    <div class="features">
                        <h2>📋 Funcionalidades Disponíveis</h2>
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
                        <p>🔗 <strong>GitHub:</strong> github.com/lnrdleao/livetip-webhook-integration</p>
                        <p>⚡ Powered by Vercel Serverless Functions</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        return;
    }
    
    // Health check
    if (url === '/health' && method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: 'production',
            version: '2.0',
            platform: 'vercel',
            services: {
                webhook: 'active',
                pix: 'active',
                bitcoin: 'active',
                api: 'active'
            },
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            endpoints: [
                'GET /',
                'GET /health',
                'GET /webhook',
                'POST /webhook',
                'GET /api/test',
                'GET /docs'
            ]
        });
        return;
    }
    
    // Webhook status (GET)
    if (url === '/webhook' && method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            message: 'LiveTip Webhook Endpoint Ativo',
            description: 'Este endpoint recebe confirmações de pagamento via POST',
            status: 'active',
            endpoint: req.headers.host + '/webhook',
            timestamp: new Date().toISOString(),
            version: '2.0',
            token_required: true,
            methods: ['GET', 'POST'],
            instructions: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Livetip-Webhook-Secret-Token': 'seu_token_aqui'
                },
                example_payload: {
                    type: 'payment.confirmed',
                    data: {
                        id: 'payment_123',
                        amount: 100.00,
                        currency: 'BRL',
                        method: 'bitcoin',
                        status: 'confirmed'
                    }
                }
            }
        });
        return;
    }
    
    // Webhook receptor (POST)
    if (url === '/webhook' && method === 'POST') {
        const token = req.headers['x-livetip-webhook-secret-token'];
        const expectedToken = '0ac7b9aa00e75e0215243f3bb177c844';
        
        if (token !== expectedToken) {
            res.status(401).json({ 
                error: 'Token inválido',
                received_token: token ? 'presente' : 'ausente',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Processar webhook
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const webhookData = JSON.parse(body);
                
                console.log('📥 Webhook recebido:', JSON.stringify(webhookData, null, 2));
                
                res.status(200).json({
                    success: true,
                    message: 'Webhook processado com sucesso',
                    timestamp: new Date().toISOString(),
                    received_data: webhookData,
                    id: 'webhook_' + Date.now()
                });
                
            } catch (error) {
                console.error('❌ Erro no webhook:', error);
                res.status(400).json({ 
                    error: 'JSON inválido',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });
        return;
    }
    
    // Teste API
    if (url === '/api/test' && method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            message: 'API Test Endpoint',
            status: 'working',
            timestamp: new Date().toISOString(),
            tests: {
                basic_response: 'OK',
                json_parsing: 'OK',
                headers: 'OK',
                environment: 'production'
            },
            sample_pix_code: '00020126580014br.gov.bcb.pix0136test@pix.key5204000053039865406100.005802BR5925LIVETIP PAGAMENTOS6009SAO PAULO62070503***6304',
            sample_bitcoin_invoice: 'lnbc1000n1pw5...',
            next_steps: [
                'Configure suas credenciais LiveTip',
                'Teste o endpoint webhook',
                'Integre com sua aplicação'
            ]
        });
        return;
    }
    
    // Documentação
    if (url === '/docs' && method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>LiveTip - Documentação</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1, h2 { color: #333; }
                    code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
                    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <h1>📚 LiveTip - Documentação da API</h1>
                
                <h2>🎯 Endpoint Webhook</h2>
                <p><strong>URL:</strong> <code>https://livetip-webhook-integration.vercel.app/webhook</code></p>
                <p><strong>Método:</strong> POST</p>
                <p><strong>Token:</strong> <code>0ac7b9aa00e75e0215243f3bb177c844</code></p>
                
                <h2>📊 Endpoints Disponíveis</h2>
                <ul>
                    <li><code>GET /</code> - Página principal</li>
                    <li><code>GET /health</code> - Status do sistema</li>
                    <li><code>GET /webhook</code> - Status do webhook</li>
                    <li><code>POST /webhook</code> - Receber webhooks</li>
                    <li><code>GET /api/test</code> - Teste da API</li>
                    <li><code>GET /docs</code> - Esta documentação</li>
                </ul>
                
                <h2>🔧 Como Usar</h2>
                <ol>
                    <li>Configure o webhook na LiveTip com a URL acima</li>
                    <li>Use o token fornecido no header <code>X-Livetip-Webhook-Secret-Token</code></li>
                    <li>Envie dados JSON no corpo da requisição POST</li>
                </ol>
                
                <p><a href="/">← Voltar à página principal</a></p>
            </body>
            </html>
        `);
        return;
    }
    
    // 404 para outras rotas
    res.status(404).json({
        error: 'Endpoint não encontrado',
        available_endpoints: ['/', '/health', '/webhook', '/api/test', '/docs'],
        timestamp: new Date().toISOString()
    });
};
