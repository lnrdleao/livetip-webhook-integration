// LiveTip MVP Simplificado - Versão para Serverless (Vercel)
// Este arquivo é otimizado para funcionar como uma função serverless
const payments = new Map();
const WEBHOOK_TOKEN = '0ac7b9aa00e75e0215243f3bb177c844';

// Helper para simplificar json parsing
function parseBody(req) {
    return new Promise((resolve) => {
        if (req.body) {
            return resolve(req.body);
        }
        
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
    });
}

// Função principal do handler
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Livetip-Webhook-Secret-Token');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Parse da URL
    const url = req.url || '';
    const method = req.method || 'GET';
    
    console.log(`${new Date().toISOString()} - ${method} ${url}`);

    try {
        // Health check
        if (url === '/health' || url === '/api/simple/health') {
            return res.json({ 
                status: 'ok', 
                timestamp: new Date().toISOString(),
                payments: payments.size,
                version: 'serverless-mvp-1.0'
            });
        }

        // Homepage simplificada
        if (url === '/' || url === '/api/simple' || url === '/api/simple/' || url === '') {
            return res.status(200).send(`
                <html>
                <head>
                    <title>LiveTip Simple API</title>
                    <style>
                        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #0066cc; }
                        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; }
                        .endpoint { background: #e8f5e8; padding: 10px; margin: 10px 0; border-radius: 5px; }
                        .method { font-weight: bold; display: inline-block; width: 60px; }
                    </style>
                </head>
                <body>
                    <h1>LiveTip Webhook API</h1>
                    <p>API simplificada para integração de webhooks do LiveTip.</p>
                    
                    <h2>Endpoints</h2>
                    
                    <div class="endpoint">
                        <div><span class="method">GET</span> /health</div>
                        <p>Verifica o status da API</p>
                    </div>
                    
                    <div class="endpoint">
                        <div><span class="method">POST</span> /generate</div>
                        <p>Cria um novo pagamento PIX</p>
                        <pre>{
    "nome": "Nome do Cliente",
    "valor": 25
}</pre>
                    </div>
                    
                    <div class="endpoint">
                        <div><span class="method">GET</span> /status/:id</div>
                        <p>Consulta o status de um pagamento</p>
                    </div>
                    
                    <div class="endpoint">
                        <div><span class="method">POST</span> /webhook</div>
                        <p>Recebe confirmação de pagamento</p>
                        <p>Header: <code>X-Livetip-Webhook-Secret-Token: ${WEBHOOK_TOKEN}</code></p>
                        <pre>{
    "id": "ID_DO_PAGAMENTO"
}</pre>
                    </div>
                    
                    <h2>Token de Autenticação</h2>
                    <pre>${WEBHOOK_TOKEN}</pre>
                </body>
                </html>
            `);
        }

        // Criar pagamento
        if ((url === '/generate' || url === '/api/simple/generate') && method === 'POST') {
            const body = await parseBody(req);
            const { nome, valor } = body;
            
            if (!nome || !valor) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Nome e valor são obrigatórios' 
                });
            }
            
            // Gerar ID único para o pagamento
            const id = 'PIX_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
            
            // Gerar um código PIX falso para simulação
            const pix = '00020126BR.GOV.BCB.PIX01' + id + '5204000053039865802BR5925LIVETIPMVP6009SAOPAULO62070503***6304' + Math.floor(Math.random()*10000);
            
            // Criar o pagamento
            const payment = {
                id,
                nome,
                valor,
                pix,
                status: 'pending',
                created: new Date().toISOString()
            };
            
            // Armazenar o pagamento
            payments.set(id, payment);
            
            return res.json({
                success: true,
                id: payment.id,
                pix: payment.pix,
                status: payment.status
            });
        }

        // Consultar status do pagamento
        if (url.startsWith('/status/') || url.startsWith('/api/simple/status/')) {
            const parts = url.split('/status/');
            const id = parts.length > 1 ? parts[1] : url.split('/api/simple/status/')[1];
            
            const payment = payments.get(id);
            
            if (!payment) {
                return res.status(404).json({ error: 'Pagamento não encontrado' });
            }
            
            return res.json({
                id: payment.id,
                status: payment.status
            });
        }

        // Receber webhook para confirmação de pagamento
        if (url === '/webhook' || url === '/api/simple/webhook') {
            // Verificar token de autenticação
            const token = req.headers['x-livetip-webhook-secret-token'];
            
            if (token !== WEBHOOK_TOKEN) {
                return res.status(401).json({ error: 'Token inválido' });
            }
            
            // Processar o corpo da requisição
            const body = await parseBody(req);
            const { id } = body;
            
            // Validar ID do pagamento
            if (!id || !payments.has(id)) {
                return res.status(400).json({ error: 'ID de pagamento inválido ou não encontrado' });
            }
            
            // Atualizar o status do pagamento
            const payment = payments.get(id);
            payment.status = 'confirmed';
            payment.confirmed_at = new Date().toISOString();
            
            console.log(`Pagamento ${id} confirmado via webhook`);
            
            return res.json({
                success: true,
                id: payment.id,
                status: payment.status
            });
        }

        // Listar todos os pagamentos (para debug)
        if (url === '/payments' || url === '/api/simple/payments') {
            const allPayments = Array.from(payments.values());
            return res.json({
                success: true,
                count: allPayments.length,
                payments: allPayments
            });
        }

        // Endpoint não encontrado
        return res.status(404).json({ error: 'Endpoint não encontrado' });
        
    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ 
            error: 'Erro interno no servidor', 
            message: error.message
        });
    }
};