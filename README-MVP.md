# LiveTip MVP - Sistema Simplificado de Webhooks

Este é um MVP (Minimum Viable Product) simplificado para testar a integração de webhooks do LiveTip com pagamentos PIX.

## 🚀 Quick Start

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o servidor MVP
```bash
npm run start:mvp
```

O servidor estará rodando em: http://localhost:3000

### 3. Testar o sistema
```bash
npm run test:mvp
```

## 📁 Arquivos Principais

- **`index.js`** - MVP principal com interface completa
- **`api/index-simple.js`** - Versão ainda mais simplificada
- **`server-mvp.js`** - Servidor HTTP simples para testes
- **`test-mvp.js`** - Script de testes automatizados

## 🔧 Endpoints Disponíveis

### Interface Web
- `GET /` - Interface web para criar e testar pagamentos

### API Endpoints
- `POST /generate` - Criar novo pagamento PIX
- `GET /status/{id}` - Consultar status do pagamento
- `POST /webhook` - Receber confirmação de pagamento (webhook)
- `GET /health` - Health check do sistema

## 📝 Como Testar

### 1. Teste Manual (Interface Web)
1. Abra http://localhost:3000
2. Preencha nome e valor
3. Clique em "Gerar Pagamento"
4. Copie o ID do pagamento
5. Use o botão "Verificar Status" para ver o status

### 2. Teste do Webhook
1. Crie um pagamento na interface
2. Copie o ID do pagamento
3. Use um tool como curl ou Postman para enviar webhook:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-Livetip-Webhook-Secret-Token: 0ac7b9aa00e75e0215243f3bb177c844" \
  -d '{"id": "SEU_PAYMENT_ID"}'
```

### 3. Teste Automatizado
```bash
npm run test:mvp
```

## 🔐 Autenticação do Webhook

O webhook requer o header de autenticação:
```
X-Livetip-Webhook-Secret-Token: 0ac7b9aa00e75e0215243f3bb177c844
```

## 📊 Estrutura de Dados

### Pagamento
```json
{
  "id": "PIX_1703876543210_abc123",
  "nome": "Usuario Teste",
  "valor": 25,
  "pix": "00020126BR.GOV.BCB.PIX...",
  "status": "pending", // ou "confirmed"
  "created": 1703876543210
}
```

### Webhook Request
```json
{
  "id": "PIX_1703876543210_abc123",
  "type": "payment_confirmed",
  "timestamp": "2023-12-29T15:15:43.210Z"
}
```

### Webhook Response
```json
{
  "success": true,
  "id": "PIX_1703876543210_abc123",
  "status": "confirmed"
}
```

## 🏗️ Arquitetura

### Fluxo Simplificado:
1. **Criar Pagamento** → Status: `pending`
2. **LiveTip chama webhook** → Status: `confirmed`
3. **Verificar status** → Retorna status atualizado

### Armazenamento:
- **Desenvolvimento**: In-memory (Map)
- **Produção**: Pode ser facilmente migrado para database

## 🔄 Status dos Pagamentos

- **`pending`** - Pagamento criado, aguardando confirmação
- **`confirmed`** - Pagamento confirmado via webhook

## 🚦 Códigos de Status HTTP

- **200** - Sucesso
- **400** - Dados inválidos
- **401** - Token de webhook inválido
- **404** - Pagamento não encontrado

## 🧪 Testes

O script `test-mvp.js` executa os seguintes testes:
1. Health check
2. Criação de pagamento
3. Verificação de status (pending)
4. Teste de token inválido
5. Confirmação via webhook
6. Verificação de status (confirmed)

## 📦 Deploy

### Vercel (Recomendado)
```bash
# O arquivo index.js já está pronto para Vercel
vercel --prod
```

### Heroku
```bash
# Usar server-mvp.js como entrypoint
heroku create sua-app
git push heroku main
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server-mvp.js"]
```

## 🔧 Configuração para Produção

1. **Variáveis de Ambiente**:
   - `PORT` - Porta do servidor (default: 3000)
   - `WEBHOOK_TOKEN` - Token de autenticação do webhook

2. **Database**: Substituir `Map()` por database real
3. **Logs**: Implementar logging adequado
4. **Monitoring**: Adicionar health checks e métricas

## 🤝 Integração com LiveTip

Para integrar com o LiveTip real:
1. Configure o webhook URL no painel do LiveTip
2. Use o token correto de autenticação
3. Implemente a lógica de negócio específica para seus pagamentos

## 📞 Suporte

O MVP está pronto para:
- ✅ Receber webhooks do LiveTip
- ✅ Validar autenticação
- ✅ Processar confirmações de pagamento
- ✅ Fornecer interface de teste
- ✅ Testes automatizados

Para questões específicas, consulte os logs do servidor e os resultados dos testes automatizados.
