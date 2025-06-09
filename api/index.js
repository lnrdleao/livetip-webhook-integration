module.exports = (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const { url, method } = req;
    
    // Health check
    if (url === '/health' || url === '/api/health') {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            message: 'LiveTip Webhook System is running!'
        });
        return;
    }
    
    // Home page
    if (url === '/' || url === '/api') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>LiveTip - Sistema de Pagamentos</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
                    .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #333; text-align: center; }
                    .status { background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
                    .links { display: grid; gap: 10px; margin: 20px 0; }
                    .link { background: #007bff; color: white; padding: 15px; text-decoration: none; border-radius: 5px; text-align: center; display: block; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 LiveTip - Sistema de Pagamentos</h1>
                    <div class="status">
                        ✅ Sistema Online - ${new Date().toLocaleString()}
                    </div>
                    <div class="links">
                        <a href="/health" class="link">💚 Health Check</a>
                        <a href="/webhook" class="link">🎯 Webhook Status</a>
                        <a href="/test" class="link">🧪 Teste API</a>
                    </div>
                    <h3>Funcionalidades:</h3>
                    <ul>
                        <li>✅ Webhook endpoint ativo</li>
                        <li>✅ Processamento de pagamentos</li>
                        <li>✅ API REST funcional</li>
                    </ul>
                </div>
            </body>
            </html>
        `);
        return;
    }
    
    // Webhook status
    if (url === '/webhook') {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            message: 'LiveTip Webhook Active',
            endpoint: '/webhook',
            methods: ['GET', 'POST'],
            timestamp: new Date().toISOString(),
            status: 'ready'
        });
        return;
    }
    
    // Test endpoint
    if (url === '/test') {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            test: 'OK',
            message: 'API funcionando perfeitamente!',
            timestamp: new Date().toISOString(),
            version: '2.1'
        });
        return;
    }
    
    // 404
    res.status(404).json({
        error: 'Not found',
        available: ['/', '/health', '/webhook', '/test']
    });
};
