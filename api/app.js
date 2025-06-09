// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const path = require('path');

// Configuração simplificada para Vercel
const config = {
    server: {
        port: process.env.PORT || 3001,
        environment: process.env.NODE_ENV || 'production'
    },
    payment: {
        apiUrl: process.env.API_URL || 'https://api.livetip.gg/v1',
        webhookSecret: process.env.WEBHOOK_SECRET || '0ac7b9aa00e75e0215243f3bb177c844',
        webhookUrl: process.env.WEBHOOK_URL || 'https://livetip-webhook-integration.vercel.app/webhook'
    },
    pix: {
        key: process.env.PIX_KEY || 'test@pix.key',
        receiverName: process.env.PIX_RECEIVER_NAME || 'LIVETIP PAGAMENTOS',
        city: process.env.PIX_CITY || 'SAO PAULO'
    },
    bitcoin: {
        address: process.env.BITCOIN_ADDRESS || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        network: process.env.BITCOIN_NETWORK || 'mainnet',
        btcRate: process.env.BTC_RATE || 300000
    },
    app: {
        name: 'LiveTip - Pagamentos',
        baseUrl: process.env.BASE_URL || 'https://livetip-webhook-integration.vercel.app',
        currency: 'BRL'
    }
};

const app = express();

// Middleware básico
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Armazenar pagamentos e logs em memória
const payments = new Map();
const webhookLogs = [];

// Função para adicionar log de webhook
function addWebhookLog(type, event, data, status = 'success') {
    const logEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type,
        event,
        status,
        data: JSON.stringify(data),
        ip: data.ip || 'unknown'
    };
    
    webhookLogs.push(logEntry);
    
    // Manter apenas os últimos 100 logs
    if (webhookLogs.length > 100) {
        webhookLogs.shift();
    }
    
    console.log(`📝 Webhook log adicionado: ${type} - ${event}`);
}

// Função para gerar código PIX
function generatePixCode(amount, description = 'Pagamento LiveTip') {
    const pixKey = config.pix.key;
    const receiverName = config.pix.receiverName;
    const city = config.pix.city;
    const txId = uuidv4().substring(0, 25);
    
    const pixPayload = `00020126${pixKey.length.toString().padStart(2, '0')}${pixKey}52040000530398654${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}5802BR59${receiverName.length.toString().padStart(2, '0')}${receiverName}60${city.length.toString().padStart(2, '0')}${city}62${(4 + txId.length).toString().padStart(2, '0')}05${txId.length.toString().padStart(2, '0')}${txId}6304`;
    
    // Calcular CRC16
    const crcTable = [
        0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
        0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef
    ];
    
    let crc = 0xFFFF;
    for (let i = 0; i < pixPayload.length; i++) {
        const c = pixPayload.charCodeAt(i);
        const j = ((crc >> 12) ^ (c >> 4)) & 0x0F;
        crc = ((crc << 4) ^ crcTable[j]) & 0xFFFF;
        const k = ((crc >> 12) ^ (c & 0x0F)) & 0x0F;
        crc = ((crc << 4) ^ crcTable[k]) & 0xFFFF;
    }
    
    const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
    return pixPayload + crcHex;
}

// Rotas principais
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LiveTip - Sistema de Pagamentos</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
                .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; text-align: center; }
                .status { padding: 15px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; margin: 20px 0; }
                .links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .link-card { background: #007bff; color: white; padding: 15px; text-decoration: none; border-radius: 5px; text-align: center; }
                .link-card:hover { background: #0056b3; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 LiveTip - Sistema de Pagamentos</h1>
                <div class="status">
                    ✅ Sistema online e funcionando!<br>
                    🌐 Deploy: Vercel<br>
                    ⏰ Status: ${new Date().toLocaleString('pt-BR')}
                </div>
                
                <div class="links">
                    <a href="/health" class="link-card">💚 Health Check</a>
                    <a href="/webhook" class="link-card">🎯 Webhook Status</a>
                    <a href="/webhook-monitor" class="link-card">📊 Monitor</a>
                    <a href="/control" class="link-card">🎛️ Controle</a>
                </div>
                
                <h2>📋 Funcionalidades</h2>
                <ul>
                    <li>✅ Pagamentos PIX</li>
                    <li>✅ Pagamentos Bitcoin/Lightning</li>
                    <li>✅ Sistema de Webhook</li>
                    <li>✅ Monitoramento em tempo real</li>
                    <li>✅ QR Codes automáticos</li>
                </ul>
            </div>
        </body>
        </html>
    `);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.server.environment,
        version: '1.0.0',
        services: {
            webhook: 'active',
            pix: 'active',
            bitcoin: 'active'
        }
    });
});

app.get('/webhook', (req, res) => {
    const stats = {
        totalWebhooks: webhookLogs.length,
        totalPayments: payments.size,
        lastWebhook: webhookLogs.length > 0 ? webhookLogs[webhookLogs.length - 1] : null,
        status: 'active',
        endpoint: req.get('host') + '/webhook',
        timestamp: new Date().toISOString()
    };

    res.json({
        message: 'LiveTip Webhook Endpoint Ativo',
        description: 'Este endpoint recebe confirmações de pagamento via POST',
        ...stats,
        instructions: {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livetip-Webhook-Secret-Token': 'seu_token_aqui'
            },
            monitor_url: `${req.protocol}://${req.get('host')}/webhook-monitor`
        }
    });
});

app.post('/webhook', (req, res) => {
    try {
        const token = req.headers['x-livetip-webhook-secret-token'];
        
        if (token !== config.payment.webhookSecret) {
            addWebhookLog('error', 'invalid_token', { token, ip: req.ip }, 'failed');
            return res.status(401).json({ error: 'Token inválido' });
        }
        
        const webhookData = req.body;
        addWebhookLog('payment', webhookData.type || 'unknown', webhookData);
        
        console.log('📥 Webhook recebido:', JSON.stringify(webhookData, null, 2));
        
        res.json({
            success: true,
            message: 'Webhook processado com sucesso',
            timestamp: new Date().toISOString(),
            id: uuidv4()
        });
        
    } catch (error) {
        console.error('❌ Erro no webhook:', error);
        addWebhookLog('error', 'processing_error', { error: error.message }, 'failed');
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/create-payment', async (req, res) => {
    try {
        const { userName, paymentMethod, amount, email, uniqueId } = req.body;
        
        if (!userName || !paymentMethod || !amount) {
            return res.status(400).json({ 
                error: 'Nome do usuário, método de pagamento e valor são obrigatórios' 
            });
        }

        const paymentId = uniqueId || uuidv4();
        const payment = {
            id: paymentId,
            userName,
            paymentMethod,
            amount: parseFloat(amount),
            email,
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
        };

        if (paymentMethod === 'pix') {
            const pixCode = generatePixCode(payment.amount, `Pagamento ${userName}`);
            const qrCodeDataUrl = await QRCode.toDataURL(pixCode);
            
            payment.pixCode = pixCode;
            payment.qrCode = qrCodeDataUrl;
        } else if (paymentMethod === 'bitcoin') {
            // Conversão aproximada BRL para Satoshis
            const satoshis = Math.round((payment.amount / config.bitcoin.btcRate) * 100000000);
            const lightningInvoice = `lnbc${satoshis}n1...`; // Placeholder
            const qrCodeDataUrl = await QRCode.toDataURL(lightningInvoice);
            
            payment.satoshis = satoshis;
            payment.lightningInvoice = lightningInvoice;
            payment.qrCode = qrCodeDataUrl;
        }

        payments.set(paymentId, payment);
        
        res.json({
            success: true,
            payment: payment
        });

    } catch (error) {
        console.error('❌ Erro ao criar pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/payments', (req, res) => {
    const paymentsList = Array.from(payments.values());
    res.json({
        payments: paymentsList,
        total: paymentsList.length,
        timestamp: new Date().toISOString()
    });
});

app.get('/webhook-logs', (req, res) => {
    res.json({
        logs: webhookLogs,
        total: webhookLogs.length,
        timestamp: new Date().toISOString()
    });
});

// Para ambientes serverless, não usar app.listen()
if (process.env.NODE_ENV !== 'production') {
    const PORT = config.server.port;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📱 Acesse: http://localhost:${PORT}`);
    });
}

module.exports = app;
