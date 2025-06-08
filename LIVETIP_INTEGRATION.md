# Integração com LiveTip Webhook

## 📋 Informações do Webhook LiveTip

### URL de Destino
Para testar localmente: `http://localhost:3000/webhook`
Para produção: `https://seu-dominio.com/webhook`

### Token Secreto
Token atual: `2400613d5c2fb33d76e76c298d1dab4c`

**⚠️ IMPORTANTE**: Este token deve ser mantido em segredo e configurado no LiveTip em: http://livetip.gg

## 🔧 Configuração no LiveTip

1. Acesse: http://livetip.gg
2. Vá para **Configurar Webhook**
3. Configure:
   - **Ativar Webhook**: ✅ Ativado
   - **URL de destino**: `https://seu-dominio.com/webhook`
   - **Token secreto**: `2400613d5c2fb33d76e76c298d1dab4c`

## 📡 Formato do Webhook

### Headers
```
Content-Type: application/json
X-Livetip-Webhook-Secret-Token: 2400613d5c2fb33d76e76c298d1dab4c
```

### Payload
```json
{
  "event": "payment_confirmed",
  "payment": {
    "sender": "string",
    "receiver": "string", 
    "content": "string",
    "amount": "number",
    "currency": "string",
    "timestamp": "string (ISO)",
    "paid": true,
    "paymentId": "string",
    "read": true
  }
}
```

## 🎯 Eventos Suportados

### payment_confirmed
Disparado quando um pagamento é confirmado com sucesso no LiveTip.

**Exemplo de payload:**
```json
{
  "event": "payment_confirmed",
  "payment": {
    "sender": "leonardo_user",
    "receiver": "livetip_merchant",
    "content": "Pagamento para LiveTip - Leonardo",
    "amount": 10.50,
    "currency": "BRL",
    "timestamp": "2025-05-28T12:30:00.000Z",
    "paid": true,
    "paymentId": "lt_pay_abc123def456",
    "read": true
  }
}
```

## 🔄 Fluxo de Integração

### 1. Usuário faz pagamento
1. Usuário preenche nome e valor na página
2. Sistema gera QR Code (PIX ou Bitcoin)
3. Pagamento é armazenado com status `pending`

### 2. Pagamento no LiveTip
1. Usuário efetua pagamento através do LiveTip
2. LiveTip processa o pagamento
3. LiveTip envia webhook para nossa aplicação

### 3. Recebimento do Webhook
1. Sistema valida token de segurança
2. Sistema processa evento `payment_confirmed`
3. Sistema atualiza status do pagamento para `completed`
4. Sistema responde com `200 OK`

## 🛡️ Segurança

### Validação do Token
```javascript
function validateLiveTipWebhook(req, res, next) {
    const webhookSecret = req.headers['x-livetip-webhook-secret-token'];
    
    if (webhookSecret !== config.payment.webhookSecret) {
        return res.status(403).json({ error: 'Token inválido' });
    }
    
    next();
}
```

### Códigos de Resposta
- `200 OK`: Webhook processado com sucesso
- `401 Unauthorized`: Token não fornecido
- `403 Forbidden`: Token inválido
- `500 Internal Server Error`: Erro no processamento

## 🧪 Teste do Webhook

### Teste Manual com curl
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-Livetip-Webhook-Secret-Token: 2400613d5c2fb33d76e76c298d1dab4c" \
  -d '{
    "event": "payment_confirmed",
    "payment": {
      "sender": "teste_usuario",
      "receiver": "livetip_merchant",
      "content": "Pagamento teste - João",
      "amount": 25.00,
      "currency": "BRL",
      "timestamp": "2025-05-28T12:30:00.000Z",
      "paid": true,
      "paymentId": "test_payment_123",
      "read": true
    }
  }'
```

### Teste com Postman
1. **Method**: POST
2. **URL**: `http://localhost:3000/webhook`
3. **Headers**:
   - `Content-Type: application/json`
   - `X-Livetip-Webhook-Secret-Token: 2400613d5c2fb33d76e76c298d1dab4c`
4. **Body**: JSON com o payload acima

## 📊 Logs e Monitoramento

### Logs do Sistema
O sistema registra:
- ✅ Webhooks recebidos com sucesso
- ❌ Webhooks rejeitados (token inválido)
- 🔄 Atualizações de status de pagamento
- ⚠️ Pagamentos não encontrados

### Exemplo de Log
```
🎉 Webhook do LiveTip recebido: {
  "event": "payment_confirmed",
  "payment": {
    "sender": "leonardo_user",
    "amount": 10.50,
    "paymentId": "lt_pay_abc123"
  }
}
✅ Pagamento uuid-123-456 atualizado para status: completed
```

## 🚀 Deploy em Produção

### Variáveis de Ambiente
```bash
# .env
WEBHOOK_SECRET=2400613d5c2fb33d76e76c298d1dab4c
BASE_URL=https://seu-dominio.com
NODE_ENV=production
```

### URL do Webhook para LiveTip
Após o deploy, configure no LiveTip:
- **URL de destino**: `https://seu-dominio.com/webhook`

### Verificação
1. Faça um pagamento teste
2. Verifique os logs da aplicação
3. Confirme que o status foi atualizado

## 🔍 Troubleshooting

### Webhook não é chamado
- ✅ Verifique se a URL está acessível publicamente
- ✅ Confirme se o webhook está ativado no LiveTip
- ✅ Verifique se a URL está correta

### Token inválido
- ✅ Confirme o token no LiveTip
- ✅ Verifique a variável de ambiente `WEBHOOK_SECRET`
- ✅ Certifique-se que não há espaços extras

### Pagamento não encontrado
- ✅ Verifique a lógica de mapeamento por valor/usuário
- ✅ Considere implementar um ID único compartilhado
- ✅ Analise os logs para identificar diferenças

## 📞 Suporte LiveTip

Para questões específicas do LiveTip:
- Site: http://livetip.gg
- Documentação da API (se disponível)
- Suporte técnico da plataforma
