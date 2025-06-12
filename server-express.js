// Servidor simples para testar LiveTip MVP
const express = require('express');
const app = express();
const cors = require('cors');

// Armazenamento em memória
const payments = new Map();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        payments: payments.size,
        version: 'express-mvp-1.0'
    });
});

// Página inicial simples
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>LiveTip Simple MVP</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                .container { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 10px 0; }
                button { background: #0066cc; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background: #0052a3; }
                .result { background: #e8f5e8; padding: 15px; margin: 10px 0; border-radius: 4px; }
                .error { background: #ffe8e8; padding: 15px; margin: 10px 0; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>LiveTip Simple MVP</h1>
            
            <div class="container">
                <h3>Create Payment</h3>
                <input type="text" id="nome" placeholder="Nome" value="Test User">
                <input type="number" id="valor" placeholder="Valor" value="10" min="1">
                <button onclick="createPayment()">Create Payment</button>
            </div>

            <div class="container">
                <h3>Check Payment</h3>
                <input type="text" id="paymentId" placeholder="Payment ID">
                <button onclick="checkPayment()">Check Status</button>
            </div>

            <div class="container">
                <h3>Test Webhook</h3>
                <input type="text" id="webhookId" placeholder="Payment ID">
                <button onclick="testWebhook()">Send Webhook</button>
            </div>

            <div id="result"></div>

            <script>
            async function createPayment() {
                const nome = document.getElementById('nome').value;
                const valor = document.getElementById('valor').value;
                
                try {
                    const response = await fetch('/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nome, valor })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('result').innerHTML = 
                            '<div class="result"><h4>Payment Created!</h4>' +
                            '<strong>ID:</strong> ' + data.id + '<br>' +
                            '<strong>Status:</strong> ' + data.status + '<br>' +
                            '<strong>PIX Code:</strong><br>' + 
                            '<textarea rows="4" style="width:100%;">' + data.pix + '</textarea></div>';
                    } else {
                        document.getElementById('result').innerHTML = 
                            '<div class="error">Error: ' + data.error + '</div>';
                    }
                } catch (e) {
                    document.getElementById('result').innerHTML = 
                        '<div class="error">Error: ' + e.message + '</div>';
                }
            }

            async function checkPayment() {
                const id = document.getElementById('paymentId').value;
                
                if (!id) {
                    alert('Please enter a Payment ID');
                    return;
                }
                
                try {
                    const response = await fetch('/status/' + id);
                    const data = await response.json();
                    
                    if (data.id) {
                        document.getElementById('result').innerHTML = 
                            '<div class="result"><h4>Payment Status</h4>' +
                            '<strong>ID:</strong> ' + data.id + '<br>' +
                            '<strong>Status:</strong> ' + data.status + '</div>';
                    } else {
                        document.getElementById('result').innerHTML = 
                            '<div class="error">Error: ' + data.error + '</div>';
                    }
                } catch (e) {
                    document.getElementById('result').innerHTML = 
                        '<div class="error">Error: ' + e.message + '</div>';
                }
            }

            async function testWebhook() {
                const id = document.getElementById('webhookId').value;
                
                if (!id) {
                    alert('Please enter a Payment ID');
                    return;
                }
                
                try {
                    const response = await fetch('/webhook', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'X-Livetip-Webhook-Secret-Token': '0ac7b9aa00e75e0215243f3bb177c844'
                        },
                        body: JSON.stringify({ id })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('result').innerHTML = 
                            '<div class="result"><h4>Webhook Success!</h4>' +
                            '<strong>ID:</strong> ' + data.id + '<br>' +
                            '<strong>Status:</strong> ' + data.status + '</div>';
                    } else {
                        document.getElementById('result').innerHTML = 
                            '<div class="error">Webhook Error: ' + data.error + '</div>';
                    }
                } catch (e) {
                    document.getElementById('result').innerHTML = 
                        '<div class="error">Webhook Error: ' + e.message + '</div>';
                }
            }
            </script>
        </body>
        </html>
    `);
});

// Geração de pagamento
app.post('/generate', (req, res) => {
    try {
        const { nome, valor } = req.body;
        
        if (!nome || !valor) {
            return res.status(400).json({ success: false, error: 'Nome e valor obrigatórios' });
        }
        
        const id = 'PIX_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
        const pix = '00020126BR.GOV.BCB.PIX01' + id + '5204000053039865802BR5925LIVETIPMVP6009SAOPAULO62070503***6304' + Math.floor(Math.random()*10000);
        
        payments.set(id, { 
            id, 
            nome, 
            valor, 
            pix, 
            status: 'pending', 
            created: Date.now() 
        });
        
        res.json({ success: true, id, pix, status: 'pending' });
    } catch (e) {
        res.status(400).json({ success: false, error: 'JSON inválido' });
    }
});

// Consulta de status
app.get('/status/:id', (req, res) => {
    const id = req.params.id;
    const payment = payments.get(id);
    
    if (!payment) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
    res.json({ id: payment.id, status: payment.status });
});

// Webhook para confirmar pagamento
app.post('/webhook', (req, res) => {
    const token = req.headers['x-livetip-webhook-secret-token'];
    
    if (token !== '0ac7b9aa00e75e0215243f3bb177c844') {
        return res.status(401).json({ error: 'Token inválido' });
    }
    
    try {
        const { id } = req.body;
        
        if (!id || !payments.has(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        payments.get(id).status = 'confirmed';
        res.json({ success: true, id, status: 'confirmed' });
    } catch (e) {
        res.status(400).json({ error: 'JSON inválido' });
    }
});

// Listar todos os pagamentos (para debug)
app.get('/payments', (req, res) => {
    const allPayments = Array.from(payments.values());
    res.json({ 
        success: true, 
        count: allPayments.length,
        payments: allPayments 
    });
});

// Executar servidor apenas se não estiver em ambiente Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Express LiveTip MVP Server running on http://localhost:${PORT}`);
    });
}

// Exportar app para Vercel
module.exports = app;
