# 🔗 Guia de Integração com Webhook

Este documento explica como integrar sua plataforma de pagamento com o sistema LiveTip.

## 📋 Informações Necessárias

Para configurar a integração, você precisará fornecer as seguintes informações:

### 1. 🏦 Configurações PIX
- **Chave PIX**: Sua chave PIX (email, telefone, CPF ou chave aleatória)
- **Nome do Recebedor**: Nome que aparecerá no PIX (máx. 25 caracteres)
- **Cidade**: Cidade do recebedor (máx. 15 caracteres)

### 2. ₿ Configurações Bitcoin
- **Endereço Bitcoin**: Endereço da sua carteira Bitcoin para receber pagamentos
- **Rede**: mainnet (produção) ou testnet (testes)

### 3. 🔑 Configurações da API
- **URL da API**: Endpoint base da sua plataforma de pagamento
- **Token de Autenticação**: Chave API para autenticar requisições
- **Chave Secreta do Webhook**: Para validar requisições do webhook

### 4. 🌐 Configurações de Deploy
- **URL Base**: URL onde sua aplicação estará hospedada
- **URL do Webhook**: URL completa onde receberá notificações

## ⚙️ Configuração do Arquivo .env

Crie um arquivo `.env` na raiz do projeto com suas configurações:

```env
# Ambiente
NODE_ENV=production
PORT=3000

# API da plataforma de pagamento
API_URL=https://api.sua-plataforma.com/v1
API_TOKEN=seu_token_de_autenticacao_aqui
WEBHOOK_SECRET=sua_chave_secreta_webhook

# Configurações PIX
PIX_KEY=seu.email@exemplo.com
PIX_RECEIVER_NAME=SUA EMPRESA LTDA
PIX_CITY=SAO PAULO

# Configurações Bitcoin
BITCOIN_ADDRESS=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
BITCOIN_NETWORK=mainnet

# URL base da aplicação
BASE_URL=https://seu-dominio.com
WEBHOOK_URL=https://seu-dominio.com/webhook
```

## 📡 Estrutura do Webhook

Sua plataforma deve enviar requisições POST para `/webhook` com a seguinte estrutura:

### Requisição de Confirmação de Pagamento

```json
{
  "event": "payment.completed",
  "paymentId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "transactionId": "txn_1234567890",
  "amount": 10.00,
  "method": "pix",
  "timestamp": "2025-05-28T12:30:45Z",
  "signature": "sha256_hash_da_requisicao"
}
```

### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `event` | string | Tipo do evento (`payment.completed`, `payment.failed`, etc.) |
| `paymentId` | string | ID único do pagamento gerado pelo LiveTip |
| `status` | string | Status do pagamento (`pending`, `completed`, `failed`) |
| `transactionId` | string | ID da transação na sua plataforma |
| `amount` | number | Valor do pagamento |
| `method` | string | Método de pagamento (`pix` ou `bitcoin`) |
| `timestamp` | string | Data/hora da transação (ISO 8601) |
| `signature` | string | Hash HMAC-SHA256 para validação |

## 🔒 Validação de Segurança

Para validar se o webhook veio realmente da sua plataforma:

```javascript
const crypto = require('crypto');

function validateWebhook(payload, signature, secret) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
}
```

## 🚀 Exemplos de Plataformas Populares

### Mercado Pago
```env
API_URL=https://api.mercadopago.com/v1
API_TOKEN=APP_USR-1234567890123456-040614-abcdef1234567890-123456789
```

### PagSeguro
```env
API_URL=https://ws.pagseguro.uol.com.br
API_TOKEN=seu_token_pagseguro
```

### Stripe
```env
API_URL=https://api.stripe.com/v1
API_TOKEN=sk_live_1234567890abcdef
```

### PayPal
```env
API_URL=https://api.paypal.com/v1
API_TOKEN=seu_access_token_paypal
```

## 🧪 Testando a Integração

### 1. Teste Local
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Acessar aplicação
http://localhost:3000
```

### 2. Teste do Webhook
Use ferramentas como ngrok para expor seu servidor local:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Usar a URL gerada como webhook
https://abc123.ngrok.io/webhook
```

### 3. Simular Webhook
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.completed",
    "paymentId": "test-payment-id",
    "status": "completed",
    "transactionId": "txn_test_123",
    "amount": 10.00,
    "method": "pix",
    "timestamp": "2025-05-28T12:30:45Z"
  }'
```

## 🔍 Logs e Monitoramento

### Verificar Logs
```bash
# Logs do servidor
tail -f logs/server.log

# Logs de webhook
tail -f logs/webhook.log
```

### Endpoints de Monitoramento
- `GET /health` - Status da aplicação
- `GET /payments` - Lista todos os pagamentos
- `GET /payment-status/:id` - Status de um pagamento específico

## 🚨 Tratamento de Erros

### Códigos de Resposta do Webhook

| Código | Significado |
|--------|-------------|
| 200 | Webhook processado com sucesso |
| 400 | Dados inválidos na requisição |
| 401 | Falha na autenticação |
| 404 | Pagamento não encontrado |
| 500 | Erro interno do servidor |

### Retry Policy
Sua plataforma deve implementar retry automático:
- Tentativas: 3x
- Intervalo: 30s, 60s, 120s
- Timeout: 30 segundos por tentativa

## 📞 Suporte

### Checklist de Problemas Comuns

- [ ] URL do webhook está acessível publicamente
- [ ] Certificado SSL válido (HTTPS obrigatório)
- [ ] Formato JSON correto na requisição
- [ ] Signature válida (se usando autenticação)
- [ ] PaymentId existe no sistema
- [ ] Logs não mostram erros 500

### Contato
Para suporte técnico:
- Email: suporte@livetip.com
- Discord: LiveTip#1234
- GitHub Issues: https://github.com/livetip/webhook-integration

---

*Última atualização: 28 de maio de 2025*
