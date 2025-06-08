// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// Debug: verificar se as variáveis estão sendo carregadas
console.log('🔍 Debug - Variáveis de ambiente PIX:');
console.log('PIX_KEY:', process.env.PIX_KEY);
console.log('PIX_RECEIVER_NAME:', process.env.PIX_RECEIVER_NAME);
console.log('PIX_CITY:', process.env.PIX_CITY);

const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');
const config = require('./config');
const LiveTipService = require('./liveTipService');
const PixGenerator = require('./pixGenerator');
const QRCodeWithLogo = require('./qrCodeGenerator');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Armazenar pagamentos e logs de webhook em memória (em produção, use um banco de dados)
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
    
    return logEntry;
}

// Inicializar serviço LiveTip
const liveTipService = new LiveTipService();

// Inicializar gerador PIX local (fallback)
const pixGenerator = new PixGenerator(config.pix);

// Inicializar gerador de QR codes com logos
const qrCodeGenerator = new QRCodeWithLogo();

// Rota principal - servir a página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para página de controle de pagamentos
app.get('/control', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'control.html'));
});

// Rota para criar um novo pagamento
app.post('/create-payment', async (req, res) => {
    try {
        const { userName, paymentMethod, amount, email, uniqueId } = req.body;
        
        if (!userName || !paymentMethod || !amount) {
            return res.status(400).json({ 
                error: 'Nome do usuário, método de pagamento e valor são obrigatórios' 
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ 
                error: 'Valor deve ser maior que zero' 
            });
        }
          // Validar valor mínimo para Bitcoin (100 satoshis ≈ R$ 0.0003)
        if (paymentMethod === 'bitcoin') {
            // Conversão aproximada: 1 BTC = R$ 300.000, 1 BTC = 100.000.000 satoshis
            const satoshis = Math.round((amount / 300000) * 100000000);
            if (satoshis < 100) {
                const minBRL = (100 / 100000000) * 300000;
                return res.status(400).json({ 
                    error: `Para pagamentos Bitcoin, o mínimo é 100 satoshis (~R$ ${minBRL.toFixed(4)})` 
                });
            }
            console.log(`💰 Pagamento Bitcoin: R$ ${amount} ≈ ${satoshis.toLocaleString()} satoshis`);
        }

        // Gerar ID único para o pagamento local
        const externalId = uuidv4();
        
        console.log(`💰 Criando pagamento ${paymentMethod.toUpperCase()} para ${userName} - R$ ${amount}`);

        let liveTipResponse;
        let paymentData;        if (paymentMethod === 'pix') {
            try {
                // Tentar criar pagamento PIX via LiveTip
                liveTipResponse = await liveTipService.createPixPayment({
                    userName,
                    amount,
                    email,
                    externalId
                });
                
                paymentData = {
                    id: externalId,
                    liveTipPaymentId: liveTipResponse.paymentId,
                    userName,
                    email,
                    method: 'pix',
                    amount,
                    status: 'pending',
                    pixCode: liveTipResponse.pixCode,
                    qrCodeImage: liveTipResponse.qrCodeImage,
                    expiresAt: liveTipResponse.expiresAt,
                    liveTipData: liveTipResponse.liveTipData,
                    source: 'livetip',
                    createdAt: new Date()
                };

                console.log('✅ Pagamento PIX criado via LiveTip API');            } catch (error) {
                console.log('⚠️ LiveTip API falhou, usando fallback local:', error.message);
                
                // Fallback: gerar PIX local
                const pixCode = pixGenerator.generatePixCode(
                    amount,
                    `Pagamento ${userName}`,
                    externalId
                );
                
                const qrCodeDataUrl = await qrCodeGenerator.generateWithLogo(pixCode, 'pix');
                
                paymentData = {
                    id: externalId,
                    userName,
                    email,
                    method: 'pix',
                    amount,
                    status: 'pending',
                    pixCode: pixCode,
                    qrCodeImage: qrCodeDataUrl,
                    pixKey: config.pix.key,
                    source: 'local',
                    createdAt: new Date()
                };

                liveTipResponse = {
                    paymentId: externalId,
                    pixCode: pixCode,
                    qrCodeImage: qrCodeDataUrl
                };

                console.log('✅ Pagamento PIX criado localmente');
            }        } else if (paymentMethod === 'bitcoin') {
            // Validar valor mínimo em satoshis (100 sats)
            if (amount < 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Valor mínimo para Bitcoin é 100 satoshis'
                });
            }

            try {
                // Tentar criar pagamento Bitcoin via LiveTip
                liveTipResponse = await liveTipService.createBitcoinPayment({
                    userName,
                    amount, // Agora amount já vem em satoshis
                    email,
                    externalId,
                    uniqueId
                });
                  // Gerar QR Code local a partir do Lightning Invoice da LiveTip
                const qrCodeDataUrl = await qrCodeGenerator.generateWithLogo(liveTipResponse.lightningInvoice, 'bitcoin');
                
                paymentData = {
                    id: externalId,
                    liveTipPaymentId: liveTipResponse.paymentId,
                    userName,
                    email,
                    method: 'bitcoin',
                    amount, // Valor em satoshis
                    satoshis: amount, // Mesmo valor, mas campo específico
                    uniqueId: uniqueId,
                    status: 'pending',
                    lightningInvoice: liveTipResponse.lightningInvoice,
                    qrCodeImage: qrCodeDataUrl,
                    expiresAt: liveTipResponse.expiresAt,
                    liveTipData: liveTipResponse.liveTipData,
                    source: 'livetip',
                    createdAt: new Date()
                };

                // Definir resposta padrão para usar QR code gerado localmente
                liveTipResponse.qrCodeImage = qrCodeDataUrl;

                console.log(`✅ Pagamento Bitcoin criado via LiveTip API - ${amount} satoshis - ID: ${uniqueId}`);

            } catch (error) {
                console.log('⚠️ LiveTip API falhou, usando fallback local:', error.message);
                
                // Fallback: gerar Bitcoin local
                const bitcoinAddress = config.bitcoin.address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
                const satoshis = Math.round((amount / 300000) * 100000000);                const bitcoinUri = `bitcoin:${bitcoinAddress}?amount=${(amount / 300000).toFixed(8)}&label=${encodeURIComponent(`Pagamento ${userName} - ${satoshis.toLocaleString()} sats`)}`;
                
                const qrCodeDataUrl = await qrCodeGenerator.generateWithLogo(bitcoinUri, 'bitcoin');
                
                paymentData = {
                    id: externalId,
                    userName,
                    email,
                    method: 'bitcoin',
                    amount,
                    satoshis: satoshis,
                    status: 'pending',
                    bitcoinAddress: bitcoinAddress,
                    bitcoinUri: bitcoinUri,
                    lightningInvoice: bitcoinUri,
                    qrCodeImage: qrCodeDataUrl,
                    source: 'local',
                    createdAt: new Date()
                };

                liveTipResponse = {
                    paymentId: externalId,
                    lightningInvoice: bitcoinUri,
                    qrCodeImage: qrCodeDataUrl
                };

                console.log('✅ Pagamento Bitcoin criado localmente');
            }
        } else {
            return res.status(400).json({ 
                error: 'Método de pagamento não suportado. Use "pix" ou "bitcoin"' 
            });
        }

        // Armazenar o pagamento
        payments.set(externalId, paymentData);

        console.log(`✅ Pagamento criado com sucesso:
            🆔 ID Local: ${externalId}
            🆔 ID LiveTip: ${liveTipResponse.paymentId}
            💳 Método: ${paymentMethod.toUpperCase()}
            💰 Valor: R$ ${amount}`);        // Responder com dados do pagamento
        res.json({
            success: true,
            paymentId: externalId,
            liveTipPaymentId: liveTipResponse.paymentId,
            qrCodeImage: liveTipResponse.qrCodeImage,
            paymentData: paymentData
        });

    } catch (error) {
        console.error('❌ Erro ao criar pagamento:', error.message);
        
        if (error.message.includes('Erro na API LiveTip')) {
            return res.status(502).json({ 
                error: 'Erro no serviço de pagamento. Tente novamente em alguns minutos.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
        
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Middleware aprimorado para validar webhook do LiveTip
function validateLiveTipWebhook(req, res, next) {
    const webhookSecret = req.headers['x-livetip-webhook-secret-token'];
    const userAgent = req.headers['user-agent'] || '';
    const contentType = req.headers['content-type'] || '';
    
    // Log de tentativa de acesso
    console.log(`🔍 Tentativa de webhook recebida:
        📡 IP: ${req.ip || req.connection.remoteAddress}
        🔑 Token presente: ${webhookSecret ? '✅' : '❌'}
        🌐 User-Agent: ${userAgent}
        📄 Content-Type: ${contentType}`);
    
    // Verificar se o header de token existe
    if (!webhookSecret) {
        console.log('❌ Webhook REJEITADO: Header X-Livetip-Webhook-Secret-Token não encontrado');
        return res.status(401).json({ 
            error: 'Token de segurança não fornecido',
            required_header: 'X-Livetip-Webhook-Secret-Token',
            timestamp: new Date().toISOString()
        });
    }
    
    // Verificar se o token é válido
    if (webhookSecret !== config.payment.webhookSecret) {
        console.log('❌ Webhook REJEITADO: Token de segurança inválido');
        console.log(`🔍 Token esperado: ${config.payment.webhookSecret.substring(0, 8)}...`);
        console.log(`🔍 Token recebido: ${webhookSecret.substring(0, 8)}...`);
        return res.status(403).json({ 
            error: 'Token de segurança inválido',
            timestamp: new Date().toISOString()
        });
    }
    
    // Verificar Content-Type
    if (!contentType.includes('application/json')) {
        console.log('⚠️ Webhook aceito mas Content-Type não é JSON:', contentType);
    }
    
    // Validar tamanho do payload (proteção contra payloads muito grandes)
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 1048576) { // 1MB limite
        console.log('❌ Webhook REJEITADO: Payload muito grande:', contentLength);
        return res.status(413).json({ 
            error: 'Payload muito grande',
            max_size: '1MB',
            received_size: contentLength
        });
    }
    
    console.log('✅ Webhook autenticado com sucesso');
    next();
}

// Rota para receber webhook do LiveTip
app.post('/webhook', validateLiveTipWebhook, (req, res) => {
    const startTime = Date.now();
    const requestData = {
        ...req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    };
    
    try {
        const timestamp = new Date().toISOString();
        console.log('🎉 Webhook do LiveTip recebido:', JSON.stringify(req.body, null, 2));
        console.log('🔒 Headers de segurança validados:', req.headers['x-livetip-webhook-secret-token'] ? '✅' : '❌');
        
        const { event, payment } = req.body;
        
        // Validar estrutura básica do payload
        if (!event || !payment) {
            console.log('❌ Payload inválido: faltam campos obrigatórios');
            addWebhookLog('webhook', event || 'unknown', requestData, 'error');
            return res.status(400).json({ 
                error: 'Payload inválido: campos "event" e "payment" são obrigatórios',
                received: false,
                timestamp 
            });
        }
        
        // Adicionar log de webhook recebido
        addWebhookLog('webhook', event, requestData, 'received');
        
        // Processar evento de pagamento confirmado
        if (event === 'payment_confirmed' && payment) {
            const { 
                sender, 
                receiver, 
                content, 
                amount, 
                currency, 
                timestamp: paymentTimestamp, 
                paid, 
                paymentId, 
                read 
            } = payment;
            
            // Validar campos obrigatórios do pagamento
            if (!sender || !amount || !paymentId || paid === undefined) {
                console.log('❌ Dados de pagamento incompletos');
                addWebhookLog('validation', event, requestData, 'error');
                return res.status(400).json({ 
                    error: 'Dados de pagamento incompletos',
                    required: ['sender', 'amount', 'paymentId', 'paid'],
                    received: false,
                    timestamp 
                });
            }
            
            console.log(`💰 Pagamento confirmado pelo LiveTip:
                🆔 Payment ID: ${paymentId}
                👤 Remetente: ${sender}
                👤 Destinatário: ${receiver || 'N/A'}
                💵 Valor: ${amount} ${currency || 'BRL'}
                📝 Conteúdo: ${content || 'N/A'}
                ✅ Status Pago: ${paid}
                🕐 Timestamp: ${paymentTimestamp}
                👁️ Lido: ${read}`);
              // Buscar pagamento correspondente com lógica melhorada (prioridade para uniqueId)
            let foundPayment = null;
            let matchMethod = '';
            
            for (let [id, storedPayment] of payments.entries()) {
                // Método 1: Match por uniqueId no conteúdo (prioridade máxima para Bitcoin)
                if (content && storedPayment.uniqueId && content.includes(storedPayment.uniqueId)) {
                    foundPayment = storedPayment;
                    matchMethod = 'uniqueId';
                    break;
                }
                
                // Método 2: Match por ID do LiveTip (confiável)
                if (storedPayment.liveTipPaymentId === paymentId) {
                    foundPayment = storedPayment;
                    matchMethod = 'liveTipPaymentId';
                    break;
                }
                
                // Método 3: Match por external ID no conteúdo
                if (content && content.includes(storedPayment.id)) {
                    foundPayment = storedPayment;
                    matchMethod = 'externalId';
                    break;
                }
                
                // Método 4: Match por nome do usuário (sender field)
                if (storedPayment.userName === sender) {
                    foundPayment = storedPayment;
                    matchMethod = 'userName';
                    break;
                }
            }
              if (foundPayment) {
                // Atualizar pagamento existente
                const oldStatus = foundPayment.status;
                foundPayment.status = paid ? 'confirmed' : 'pending';
                foundPayment.liveTipPaymentId = paymentId;
                foundPayment.liveTipData = payment;
                foundPayment.liveTipTimestamp = paymentTimestamp;
                foundPayment.updatedAt = new Date();
                foundPayment.webhookReceived = true;
                
                console.log(`✅ Pagamento encontrado e atualizado:
                    🆔 Local ID: ${foundPayment.id}
                    🔑 Unique ID: ${foundPayment.uniqueId || 'N/A'}
                    🔍 Match por: ${matchMethod}
                    📊 Status: ${oldStatus} → ${foundPayment.status}
                    👤 Nome: ${foundPayment.userName}
                    💰 Valor: ${foundPayment.amount} ${foundPayment.method === 'bitcoin' ? 'sats' : 'BRL'}
                    🕐 Atualizado: ${foundPayment.updatedAt.toISOString()}`);
                    
                addWebhookLog('payment_update', event, { 
                    localId: foundPayment.id,
                    uniqueId: foundPayment.uniqueId,
                    liveTipId: paymentId, 
                    matchMethod, 
                    oldStatus, 
                    newStatus: foundPayment.status,
                    userName: foundPayment.userName
                }, 'success');
                    
            } else {
                console.log(`⚠️ Pagamento não encontrado nos registros locais`);
                
                // Extrair uniqueId do conteúdo se disponível
                let extractedUniqueId = null;
                if (content && content.includes('BTC_')) {
                    const matches = content.match(/BTC_\d+_[A-Z0-9]+/);
                    extractedUniqueId = matches ? matches[0] : null;
                }
                
                // Criar novo registro baseado no webhook do LiveTip
                const newPaymentId = uuidv4();
                const newPayment = {
                    id: newPaymentId,
                    userName: sender,
                    receiver: receiver || 'unknown',
                    method: currency === 'BTC' ? 'bitcoin' : 'pix',
                    amount: parseFloat(amount),
                    currency: currency || 'BRL',
                    uniqueId: extractedUniqueId,
                    status: paid ? 'confirmed' : 'pending',
                    liveTipPaymentId: paymentId,
                    liveTipData: payment,
                    liveTipTimestamp: paymentTimestamp,
                    content: content,
                    source: 'webhook',
                    webhookReceived: true,
                    createdAt: new Date(paymentTimestamp || timestamp),
                    updatedAt: new Date(),
                    timestamp: new Date(paymentTimestamp || timestamp).toISOString()
                };
                
                payments.set(newPaymentId, newPayment);
                console.log(`📝 Novo pagamento criado via webhook:
                    🆔 Local ID: ${newPaymentId}
                    🔑 Unique ID: ${extractedUniqueId || 'N/A'}
                    🆔 LiveTip ID: ${paymentId}
                    👤 Nome: ${sender}
                    💰 Valor: ${amount} ${currency || 'BRL'}
                    📊 Status: ${newPayment.status}`);
                    
                addWebhookLog('payment_create', event, { 
                    localId: newPaymentId,
                    uniqueId: extractedUniqueId,
                    liveTipId: paymentId, 
                    amount,
                    userName: sender,
                    status: newPayment.status 
                }, 'success');
            }
            
        } else if (event === 'payment_pending') {
            // Processar pagamento pendente
            console.log(`⏳ Pagamento pendente recebido: ${payment?.paymentId}`);
            addWebhookLog('payment_pending', event, { paymentId: payment?.paymentId }, 'processed');
            
        } else if (event === 'payment_failed') {
            // Processar pagamento falhado
            console.log(`❌ Pagamento falhou: ${payment?.paymentId}`);
            addWebhookLog('payment_failed', event, { paymentId: payment?.paymentId }, 'processed');
            
        } else if (event === 'payment_cancelled') {
            // Processar pagamento cancelado
            console.log(`🚫 Pagamento cancelado: ${payment?.paymentId}`);
            addWebhookLog('payment_cancelled', event, { paymentId: payment?.paymentId }, 'processed');
            
        } else {
            console.log(`ℹ️ Evento "${event}" recebido mas não processado ativamente`);
            addWebhookLog('event_ignored', event, { paymentId: payment?.paymentId }, 'ignored');
        }

        // Resposta de sucesso para confirmar recebimento
        const processingTime = Date.now() - startTime;
        const response = { 
            success: true,
            received: true, 
            event: event,
            paymentId: payment?.paymentId,
            processed: ['payment_confirmed', 'payment_pending', 'payment_failed', 'payment_cancelled'].includes(event),
            processingTime: `${processingTime}ms`,
            timestamp: timestamp
        };
        
        console.log(`✅ Webhook processado com sucesso em ${processingTime}ms`);
        addWebhookLog('response', event, response, 'success');
        res.status(200).json(response);
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('❌ Erro crítico ao processar webhook do LiveTip:', error);
        console.error('📜 Stack trace:', error.stack);
        
        addWebhookLog('error', req.body?.event || 'unknown', { 
            error: error.message, 
            stack: error.stack 
        }, 'error');
        
        // Resposta de erro mas ainda confirma recebimento
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            received: true, // Ainda confirma recebimento para evitar reenvios
            processingTime: `${processingTime}ms`,
            timestamp: new Date().toISOString(),
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Rota para verificar status do pagamento
app.get('/payment-status/:id', (req, res) => {
    const paymentId = req.params.id;
    const payment = payments.get(paymentId);
    
    if (!payment) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
    res.json(payment);
});

// Rota para listar todos os pagamentos (para debug)
app.get('/payments', (req, res) => {
    const allPayments = Array.from(payments.values());
    res.json({
        total: allPayments.length,
        payments: allPayments
    });
});

// Rota para logs de webhook (para monitoramento)
app.get('/webhook-logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const eventFilter = req.query.event;
    const statusFilter = req.query.status;
    
    let filteredLogs = [...webhookLogs];
    
    if (eventFilter) {
        filteredLogs = filteredLogs.filter(log => log.event === eventFilter);
    }
    
    if (statusFilter) {
        filteredLogs = filteredLogs.filter(log => log.status === statusFilter);
    }
    
    // Ordernar por timestamp (mais recentes primeiro)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
        total: filteredLogs.length,
        logs: filteredLogs.slice(0, limit),
        filters: { event: eventFilter, status: statusFilter, limit }
    });
});

// Rota para estatísticas do webhook
app.get('/webhook-stats', (req, res) => {
    const stats = {
        totalWebhooks: webhookLogs.length,
        totalPayments: payments.size,
        eventCounts: {},
        statusCounts: {},
        recentActivity: webhookLogs.slice(-10).reverse()
    };
    
    // Contar eventos por tipo
    webhookLogs.forEach(log => {
        stats.eventCounts[log.event] = (stats.eventCounts[log.event] || 0) + 1;
        stats.statusCounts[log.status] = (stats.statusCounts[log.status] || 0) + 1;
    });
    
    // Estatísticas de pagamentos
    const paymentStats = {
        pending: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
    };
    
    payments.forEach(payment => {
        if (paymentStats.hasOwnProperty(payment.status)) {
            paymentStats[payment.status]++;
        }
    });
    
    stats.paymentStats = paymentStats;
    
    res.json(stats);
});

// Rota para testar webhook (desenvolvimento)
app.post('/test-webhook', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Endpoint não disponível em produção' });
    }
    
    const testPayload = req.body || {
        event: 'payment_confirmed',
        payment: {
            sender: 'test_user',
            receiver: 'test_merchant',
            content: 'Pagamento teste',
            amount: 10.00,
            currency: 'BRL',
            timestamp: new Date().toISOString(),
            paid: true,
            paymentId: `test_${Date.now()}`,
            read: true
        }
    };
    
    console.log('🧪 Webhook de teste disparado:', JSON.stringify(testPayload, null, 2));
    
    // Chamar o próprio endpoint de webhook
    fetch('http://localhost:3001/webhook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Livetip-Webhook-Secret-Token': config.payment.webhookSecret
        },
        body: JSON.stringify(testPayload)
    })
    .then(response => response.json())
    .then(result => {
        res.json({ 
            success: true, 
            testPayload, 
            webhookResponse: result 
        });
    })
    .catch(error => {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            testPayload 
        });
    });
});

// Rota para gerar QR Code (usado pelo frontend)
app.post('/generate-qr', async (req, res) => {
    try {
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

        // Gerar ID único para o pagamento local
        const externalId = uuidv4();
        
        // Log detalhado
        if (paymentMethod === 'bitcoin') {
            console.log(`⚡ Criando pagamento Bitcoin:
                👤 Nome: ${userName}
                💰 Satoshis: ${amount}
                🔑 ID Único: ${uniqueId}
                🆔 Payment ID: ${externalId}`);
        } else {
            console.log(`🏦 Criando pagamento PIX:
                👤 Nome: ${userName}
                💰 Valor: R$ ${amount}
                🆔 Payment ID: ${externalId}`);
        }

        let liveTipResponse;
        let paymentData;

        if (paymentMethod === 'pix') {
            // Lógica PIX existente...
            try {
                liveTipResponse = await liveTipService.createPixPayment({
                    userName,
                    amount,
                    email: `${userName.toLowerCase().replace(/\s+/g, '')}@livetip.local`,
                    externalId
                });
                
                paymentData = {
                    id: externalId,
                    liveTipPaymentId: liveTipResponse.paymentId,
                    userName,
                    method: 'pix',
                    amount,
                    status: 'pending',
                    pixCode: liveTipResponse.pixCode,
                    qrCodeImage: liveTipResponse.qrCodeImage,
                    source: 'livetip',
                    createdAt: new Date()
                };

                console.log('✅ Pagamento PIX criado via LiveTip API');

            } catch (error) {
                console.log('⚠️ LiveTip API falhou, usando fallback PIX local:', error.message);
                  // Fallback: gerar PIX local
                const pixCode = pixGenerator.generatePixCode(
                    amount,
                    `Pagamento ${userName}`,
                    externalId
                );
                
                const qrCodeDataUrl = await qrCodeGenerator.generateWithLogo(pixCode, 'pix');
                
                paymentData = {
                    id: externalId,
                    userName,
                    method: 'pix',
                    amount,
                    status: 'pending',
                    pixCode: pixCode,
                    qrCodeImage: qrCodeDataUrl,
                    source: 'local',
                    createdAt: new Date()
                };

                liveTipResponse = {
                    paymentId: externalId,
                    pixCode: pixCode,
                    qrCodeImage: qrCodeDataUrl
                };

                console.log('✅ Pagamento PIX criado localmente');
            }

        } else if (paymentMethod === 'bitcoin') {
            // Validar valor mínimo em satoshis (100 sats)
            if (amount < 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Valor mínimo para Bitcoin é 100 satoshis'
                });
            }

            try {
                // Tentar criar pagamento Bitcoin via LiveTip
                liveTipResponse = await liveTipService.createBitcoinPayment({
                    userName,
                    amount, // Valor em satoshis
                    email: `${userName.toLowerCase().replace(/\s+/g, '')}@livetip.local`,
                    externalId,
                    uniqueId
                });
                  // Gerar QR Code local a partir do Lightning Invoice da LiveTip
                const qrCodeDataUrl = await qrCodeGenerator.generateWithLogo(liveTipResponse.lightningInvoice, 'bitcoin');
                
                paymentData = {
                    id: externalId,
                    liveTipPaymentId: liveTipResponse.paymentId,
                    userName,
                    method: 'bitcoin',
                    amount, // Valor em satoshis
                    satoshis: amount,
                    uniqueId: uniqueId,
                    status: 'pending',
                    lightningInvoice: liveTipResponse.lightningInvoice,
                    qrCodeImage: qrCodeDataUrl,
                    source: 'livetip',
                    createdAt: new Date()
                };

                liveTipResponse.qrCodeImage = qrCodeDataUrl;

                console.log(`✅ Pagamento Bitcoin criado via LiveTip API - ${amount} satoshis - ID: ${uniqueId}`);

            } catch (error) {
                console.log('⚠️ LiveTip API falhou, usando fallback Bitcoin local:', error.message);
                  // Fallback: gerar Bitcoin URI local
                const bitcoinAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'; // Endereço de exemplo
                const bitcoinUri = `bitcoin:${bitcoinAddress}?amount=${amount / 100000000}&label=Pagamento%20${encodeURIComponent(userName)}`;
                
                const qrCodeDataUrl = await qrCodeGenerator.generateWithLogo(bitcoinUri, 'bitcoin');
                
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
                    qrCodeImage: qrCodeDataUrl,
                    source: 'local',
                    createdAt: new Date()
                };

                liveTipResponse = {
                    paymentId: externalId,
                    qrCodeImage: qrCodeDataUrl
                };

                console.log(`✅ Pagamento Bitcoin criado localmente - ${amount} satoshis - ID: ${uniqueId}`);
            }
        }

        // Armazenar o pagamento
        payments.set(externalId, paymentData);        // Resposta no formato esperado pelo frontend
        res.json({
            success: true,
            data: {
                paymentId: externalId,
                userName: userName,
                amount: amount,
                satoshis: paymentMethod === 'bitcoin' ? amount : undefined,
                uniqueId: uniqueId,
                method: paymentMethod,
                qrCodeText: paymentData.lightningInvoice || paymentData.bitcoinUri || paymentData.pixCode,
                qrCodeImage: paymentData.qrCodeImage, // Adicionar imagem do QR Code
                lightningInvoice: paymentData.lightningInvoice,
                bitcoinUri: paymentData.bitcoinUri,
                bitcoinAddress: paymentData.bitcoinAddress,
                pixCode: paymentData.pixCode,
                source: paymentData.source
            }
        });

    } catch (error) {
        console.error('❌ Erro ao gerar QR Code:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ${config.app.name} rodando na porta ${PORT}`);
    console.log(`📱 Acesse: ${config.app.baseUrl}`);
    console.log(`🔗 Webhook URL: ${config.app.baseUrl}/webhook`);
    console.log(`💰 PIX Key: ${config.pix.key}`);
    console.log(`₿ Bitcoin Address: ${config.bitcoin.address}`);
    console.log(`🌍 Environment: ${config.server.environment}`);
    console.log('');
    console.log('📊 Endpoints disponíveis:');
    console.log(`   GET  ${config.app.baseUrl}/                 - Interface principal`);
    console.log(`   POST ${config.app.baseUrl}/create-payment   - Criar pagamento`);
    console.log(`   POST ${config.app.baseUrl}/webhook          - Receber webhook LiveTip`);
    console.log(`   GET  ${config.app.baseUrl}/payments         - Listar pagamentos`);
    console.log(`   GET  ${config.app.baseUrl}/payment-status/:id - Status de pagamento`);
    console.log(`   GET  ${config.app.baseUrl}/webhook-logs     - Logs do webhook`);
    console.log(`   GET  ${config.app.baseUrl}/webhook-stats    - Estatísticas`);
    console.log(`   POST ${config.app.baseUrl}/test-webhook     - Testar webhook (dev)`);
    console.log('');
    console.log('🔑 Token do webhook LiveTip configurado');
    console.log('✅ Sistema pronto para receber pagamentos!');
});
