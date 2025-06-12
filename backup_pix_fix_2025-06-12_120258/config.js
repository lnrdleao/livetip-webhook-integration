// Configurações da aplicação
const config = {
    // Configurações do servidor
    server: {
        port: process.env.PORT || 3001,
        environment: process.env.NODE_ENV || 'development'
    },
    
    // Configurações da plataforma de pagamento
    payment: {
        // ATENÇÃO: Esta URL base é apenas informativa.
        // Na implementação atual, estamos usando os endpoints diretos:
        // https://api.livetip.gg/api/v1/message/10 (para PIX e Bitcoin)
        apiUrl: process.env.API_URL || 'https://api.livetip.gg/api/v1',
        
        // Token de autenticação (se necessário)
        apiToken: process.env.API_TOKEN || '',
        
        // Chave secreta para validar webhooks do LiveTip
        webhookSecret: process.env.WEBHOOK_SECRET || '0ac7b9aa00e75e0215243f3bb177c844',
        
        // URL pública do seu webhook (onde o LiveTip enviará notificações)
        webhookUrl: process.env.WEBHOOK_URL || 'https://seu-dominio.com/webhook'
    },    // Configurações PIX
    pix: {
        // Sua chave PIX (pode ser email, telefone, CPF ou chave aleatória)
        key: process.env.PIX_KEY || 'usuario@exemplo.com',
        
        // Nome do recebedor que aparece no PIX
        receiverName: process.env.PIX_RECEIVER_NAME || 'LIVETIP PAGAMENTOS',
        
        // Cidade do recebedor
        city: process.env.PIX_CITY || 'SAO PAULO'
    },
    
    // Configurações Bitcoin
    bitcoin: {
        // Endereço da sua carteira Bitcoin
        address: process.env.BITCOIN_ADDRESS || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        
        // Network (mainnet ou testnet)
        network: process.env.BITCOIN_NETWORK || 'mainnet',
        
        // Taxa de conversão BRL para BTC (aproximada)
        btcRate: process.env.BTC_RATE || 300000
    },
    
    // Configurações gerais
    app: {
        name: 'LiveTip - Pagamentos',
        baseUrl: process.env.BASE_URL || 'http://localhost:3001',
        currency: 'BRL'
    }
};

module.exports = config;
