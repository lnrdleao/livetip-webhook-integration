# 🔗 Configuração do Webhook LiveTip - GUIA COMPLETO

## 📋 Informações para Configuração

### 🔑 **Token Secreto**
```
37de1854e9469607092124ed015c1f91
```

### 🌐 **URL de Destino**
Para desenvolvimento local:
```
http://localhost:3001/webhook
```

Para produção (substitua pelo seu domínio):
```
https://seusite.com/webhook
```

## 🚀 **Passo a Passo para Configurar no LiveTip**

### 1. **Acesse o Painel do LiveTip**
- URL: **http://livetip.gg**
- Faça login com suas credenciais

### 2. **Navegue para Configurações de Webhook**
- Procure por "**Configurar Webhook**" ou "**Webhook Configuration**"
- Ou vá diretamente para a seção de configurações

### 3. **Configure os Campos**

#### ✅ **Ativar Webhook**
- Marque como **ATIVADO** / **ENABLED**
- Se desativado, nenhuma notificação será enviada

#### 🌐 **URL de Destino**
```
https://seusite.com/webhook
```
**⚠️ Para desenvolvimento local:**
- Use ngrok ou similar para expor seu servidor local
- Substitua pela URL pública gerada

#### 🔑 **Token Secreto**
```
37de1854e9469607092124ed015c1f91
```
- Cole exatamente este token
- **IMPORTANTE**: Este token garante a autenticidade das requisições

### 4. **Eventos para Ativar**
Certifique-se de que os seguintes eventos estão ativos:
- ✅ `payment_confirmed` - Pagamento confirmado
- ✅ `payment_pending` - Pagamento pendente
- ✅ `payment_failed` - Pagamento falhado
- ✅ `payment_cancelled` - Pagamento cancelado

## 🛠️ **Para Desenvolvimento Local**

### Usando ngrok (Recomendado)
```bash
# 1. Instalar ngrok globalmente
npm install -g ngrok

# 2. Executar seu servidor
npm start

# 3. Em outro terminal, expor a porta 3001
ngrok http 3001

# 4. Usar a URL gerada (ex: https://abc123.ngrok.io/webhook)
```

### Exemplo de URL gerada pelo ngrok:
```
https://abc123def456.ngrok.io/webhook
```

## ✅ **Verificação da Configuração**

### 1. **Teste o Webhook**
Execute o teste automatizado:
```bash
npm run test:webhook
```

### 2. **Verifique os Logs**
```bash
# Visualizar logs em tempo real
tail -f logs/webhook.log

# Ou acessar via browser
http://localhost:3001/webhook-logs
```

### 3. **Endpoints de Monitoramento**
- **Logs**: http://localhost:3001/webhook-logs
- **Estatísticas**: http://localhost:3001/webhook-stats
- **Pagamentos**: http://localhost:3001/payments

## 🔍 **Estrutura do Payload Esperado**

O LiveTip enviará requisições POST com esta estrutura:

```json
{
  "event": "payment_confirmed",
  "payment": {
    "sender": "nome_do_usuario",
    "receiver": "nome_do_merchant",
    "content": "Descrição do pagamento",
    "amount": 25.50,
    "currency": "BRL",
    "timestamp": "2025-06-07T12:30:00.000Z",
    "paid": true,
    "paymentId": "lt_pay_123456789",
    "read": true
  }
}
```

## 🔒 **Validação de Segurança**

O sistema validará automaticamente:
- ✅ Header `X-Livetip-Webhook-Secret-Token` presente
- ✅ Token corresponde ao configurado
- ✅ Payload JSON válido
- ✅ Campos obrigatórios presentes

## 📊 **Códigos de Resposta**

| Código | Descrição | Ação |
|--------|-----------|------|
| **200** | Webhook processado com sucesso | ✅ Continuar |
| **401** | Token não fornecido | ❌ Verificar header |
| **403** | Token inválido | ❌ Verificar token |
| **400** | Payload inválido | ❌ Verificar formato |
| **500** | Erro interno | ⚠️ Verificar logs |

## 🚨 **Troubleshooting**

### Webhook não é chamado
- ✅ Verifique se a URL está acessível publicamente
- ✅ Confirme se o webhook está ativado no LiveTip
- ✅ Teste a URL manualmente com curl

### Token inválido
- ✅ Confirme o token no arquivo `.env`
- ✅ Reinicie o servidor após alterar configurações
- ✅ Verifique se não há espaços extras no token

### Pagamento não encontrado
- ✅ Verifique a lógica de mapeamento por valor/usuário
- ✅ Analise os logs em `/webhook-logs`
- ✅ Confirme se o usuário/valor corresponde

## 📱 **Teste Rápido**

### Usando curl:
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "X-Livetip-Webhook-Secret-Token: 37de1854e9469607092124ed015c1f91" \
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

### Resposta esperada:
```json
{
  "success": true,
  "received": true,
  "event": "payment_confirmed",
  "paymentId": "test_123",
  "processed": true,
  "processingTime": "15ms",
  "timestamp": "2025-06-07T12:30:00.000Z"
}
```

## 🎯 **Status de Implementação**

- ✅ **Endpoint webhook configurado** (`/webhook`)
- ✅ **Validação de token implementada**
- ✅ **Suporte a múltiplos eventos**
- ✅ **Sistema de logs detalhado**
- ✅ **Endpoints de monitoramento**
- ✅ **Testes automatizados**
- ✅ **QR Codes com logos** (Bitcoin e PIX)

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs: `http://localhost:3001/webhook-logs`
2. Execute os testes: `npm run test:webhook`
3. Consulte a documentação do LiveTip
4. Verifique a conectividade da URL

---

**✅ SISTEMA PRONTO PARA PRODUÇÃO!**

*Última atualização: 7 de junho de 2025*
*Token atualizado: 37de1854e9469607092124ed015c1f91*
