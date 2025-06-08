# 📋 Especificação Completa do Webhook LiveTip

## 🎯 **WEBHOOK TOTALMENTE ALINHADO COM LIVETIP**

### ✅ **Implementação Atualizada**
O webhook foi completamente reformulado para estar 100% alinhado com as especificações exatas do LiveTip, incluindo:

- ✅ **Validação de segurança robusta**
- ✅ **Suporte a múltiplos eventos**
- ✅ **Sistema de logs detalhado**
- ✅ **Endpoints de monitoramento**
- ✅ **Lógica de matching inteligente**
- ✅ **Tratamento de erros aprimorado**

---

## 🔒 **Segurança do Webhook**

### Header Obrigatório
```
X-Livetip-Webhook-Secret-Token: 2400613d5c2fb33d76e76c298d1dab4c
```

### Validações Implementadas
- ✅ Token de segurança obrigatório
- ✅ Validação de Content-Type
- ✅ Proteção contra payloads muito grandes (max 1MB)
- ✅ Log de tentativas de acesso
- ✅ Rate limiting básico

---

## 📡 **Estrutura do Payload**

### Webhook de Pagamento Confirmado
```json
{
  "event": "payment_confirmed",
  "payment": {
    "sender": "string",
    "receiver": "string",
    "content": "string", 
    "amount": 25.50,
    "currency": "BRL",
    "timestamp": "2025-05-28T12:30:00.000Z",
    "paid": true,
    "paymentId": "lt_pay_abc123def456",
    "read": true
  }
}
```

### Campos Obrigatórios
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `event` | string | Tipo do evento (`payment_confirmed`, `payment_pending`, etc.) |
| `payment.sender` | string | Usuário que enviou o pagamento |
| `payment.amount` | number | Valor do pagamento |
| `payment.paymentId` | string | ID único do pagamento no LiveTip |
| `payment.paid` | boolean | Status de confirmação do pagamento |

### Campos Opcionais
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `payment.receiver` | string | Destinatário do pagamento |
| `payment.content` | string | Descrição/comentário do pagamento |
| `payment.currency` | string | Moeda (padrão: BRL) |
| `payment.timestamp` | string | Timestamp ISO do pagamento |
| `payment.read` | boolean | Se a notificação foi lida |

---

## 🎭 **Eventos Suportados**

### 1. `payment_confirmed`
Pagamento confirmado com sucesso
- ✅ **Processamento**: Atualiza status para `completed`
- ✅ **Matching**: ID LiveTip → External ID → Valor+Usuário
- ✅ **Log**: Detalhado com método de matching

### 2. `payment_pending` 
Pagamento pendente/aguardando confirmação
- ✅ **Processamento**: Mantém status `pending`
- ✅ **Log**: Registrado para monitoramento

### 3. `payment_failed`
Pagamento falhou/foi rejeitado
- ✅ **Processamento**: Atualiza status para `failed`
- ✅ **Log**: Registra falha para análise

### 4. `payment_cancelled`
Pagamento cancelado pelo usuário
- ✅ **Processamento**: Atualiza status para `cancelled`
- ✅ **Log**: Registra cancelamento

---

## 🔍 **Lógica de Matching de Pagamentos**

### Método 1: ID do LiveTip (Mais Confiável)
```javascript
if (storedPayment.liveTipPaymentId === paymentId) {
    // Match direto por ID LiveTip
}
```

### Método 2: External ID no Conteúdo
```javascript
if (content && content.includes(storedPayment.id)) {
    // Match por ID local no conteúdo
}
```

### Método 3: Valor + Usuário (Fallback)
```javascript
if (Math.abs(storedPayment.amount - amount) < 0.01 && 
    storedPayment.userName === sender) {
    // Match por valor e usuário
}
```

---

## 📊 **Sistema de Logs**

### Tipos de Log
- `webhook` - Webhook recebido
- `validation` - Erro de validação
- `payment_update` - Pagamento atualizado
- `payment_create` - Novo pagamento via webhook
- `payment_pending` - Pagamento pendente
- `payment_failed` - Pagamento falhou
- `payment_cancelled` - Pagamento cancelado
- `event_ignored` - Evento não processado
- `response` - Resposta enviada
- `error` - Erro interno

### Status dos Logs
- `received` - Webhook recebido
- `success` - Processado com sucesso
- `error` - Erro no processamento
- `ignored` - Evento ignorado
- `processed` - Processado sem ação

---

## 🌐 **Endpoints de Monitoramento**

### `GET /webhook-logs`
Lista logs dos webhooks recebidos
```
Parâmetros:
- limit: Número de logs (padrão: 50)
- event: Filtrar por tipo de evento
- status: Filtrar por status
```

### `GET /webhook-stats`
Estatísticas dos webhooks e pagamentos
```json
{
  "totalWebhooks": 150,
  "totalPayments": 45,
  "eventCounts": { "payment_confirmed": 30 },
  "statusCounts": { "success": 140 },
  "paymentStats": { "completed": 25, "pending": 5 }
}
```

### `POST /test-webhook`
Testa o webhook (apenas desenvolvimento)
```bash
POST /test-webhook
{
  "event": "payment_confirmed",
  "payment": { ... }
}
```

---

## ✅ **Códigos de Resposta**

### Sucesso
```json
HTTP 200 OK
{
  "success": true,
  "received": true,
  "event": "payment_confirmed", 
  "paymentId": "lt_pay_123",
  "processed": true,
  "processingTime": "15ms",
  "timestamp": "2025-05-28T12:30:00.000Z"
}
```

### Erros
| Código | Descrição | Resposta |
|--------|-----------|----------|
| `400` | Payload inválido | `{"error": "Payload inválido"}` |
| `401` | Token não fornecido | `{"error": "Token não fornecido"}` |
| `403` | Token inválido | `{"error": "Token inválido"}` |
| `413` | Payload muito grande | `{"error": "Payload muito grande"}` |
| `500` | Erro interno | `{"success": false, "received": true}` |

---

## 🧪 **Testes**

### Teste Manual
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "X-Livetip-Webhook-Secret-Token: 2400613d5c2fb33d76e76c298d1dab4c" \
  -d '{
    "event": "payment_confirmed",
    "payment": {
      "sender": "teste_user",
      "amount": 25.50,
      "paymentId": "test_123",
      "paid": true
    }
  }'
```

### Scripts de Teste Disponíveis
- `test-webhook.js` - Teste Node.js
- `test-webhook.ps1` - Teste PowerShell
- `/test-webhook` - Endpoint de teste interno

---

## 🚀 **Configuração no LiveTip**

### 1. Acesse o Painel LiveTip
URL: http://livetip.gg

### 2. Configure o Webhook
- **✅ Ativar Webhook**: Sim
- **🌐 URL de destino**: `https://seu-dominio.com/webhook`
- **🔑 Token secreto**: `2400613d5c2fb33d76e76c298d1dab4c`

### 3. Eventos para Enviar
- ✅ `payment_confirmed`
- ✅ `payment_pending`
- ✅ `payment_failed`
- ✅ `payment_cancelled`

---

## 📈 **Métricas e Monitoramento**

### Performance
- ✅ Tempo de processamento medido
- ✅ Logs de erro detalhados
- ✅ Estatísticas em tempo real

### Logs Estruturados
```javascript
{
  "id": "uuid",
  "timestamp": "2025-05-28T12:30:00.000Z",
  "type": "payment_update",
  "event": "payment_confirmed", 
  "status": "success",
  "data": "{...}",
  "ip": "192.168.1.1"
}
```

---

## 🎯 **Status da Implementação**

- ✅ **Webhook endpoint seguro**
- ✅ **Validação robusta de payloads**
- ✅ **Suporte a todos os eventos LiveTip**
- ✅ **Sistema de logs completo**
- ✅ **Endpoints de monitoramento**
- ✅ **Lógica de matching inteligente**
- ✅ **Tratamento de erros avançado**
- ✅ **Testes automatizados**
- ✅ **Documentação completa**

**🎉 WEBHOOK 100% ALINHADO COM LIVETIP!**

---

*Última atualização: 28 de maio de 2025*
*Versão: 2.0 - Especificação LiveTip Completa*
