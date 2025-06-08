# Webhook Payment Page - LiveTip

Uma página web simples para integração com webhook de pagamentos que gera QR codes para PIX e Bitcoin.

## 🚀 Características

- ✅ Interface moderna e responsiva
- ✅ Suporte a pagamentos PIX e Bitcoin
- ✅ Geração automática de QR codes
- ✅ Verificação de status em tempo real
- ✅ Histórico de pagamentos
- ✅ Webhook para receber notificações de pagamento

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure suas credenciais da plataforma de pagamento no arquivo `server.js`:
```javascript
const WEBHOOK_CONFIG = {
    apiUrl: 'https://sua-plataforma.com/api',
    apiToken: 'SEU_TOKEN_AQUI',
    webhookUrl: 'https://seu-dominio.com/webhook'
};
```

3. Execute o servidor:
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

4. Acesse: http://localhost:3000

## 🔧 Configuração

### Informações Necessárias da Sua Plataforma

Para integrar com sua plataforma de pagamento, você precisará fornecer:

1. **URL da API**: Endpoint base da sua plataforma
2. **Token de Autenticação**: Chave API para autenticar requisições
3. **Chave PIX**: Para pagamentos PIX (email, telefone, CPF ou chave aleatória)
4. **Endereço Bitcoin**: Carteira Bitcoin para receber pagamentos
5. **URL do Webhook**: URL pública onde sua plataforma enviará notificações

### Exemplo de Configuração Real

```javascript
// Substitua no server.js
const WEBHOOK_CONFIG = {
    apiUrl: 'https://api.mercadopago.com/v1',
    apiToken: 'APP_USR-1234567890123456-040614-abcdef1234567890-123456789',
    webhookUrl: 'https://meusite.com/webhook'
};

// Para PIX
pixKey: 'usuario@gmail.com', // ou CPF: '12345678901'

// Para Bitcoin  
bitcoinAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
```

## 📡 Endpoints da API

- `GET /` - Página principal
- `POST /create-payment` - Criar novo pagamento
- `POST /webhook` - Receber notificações da plataforma
- `GET /payment-status/:id` - Verificar status do pagamento
- `GET /payments` - Listar todos os pagamentos

## 🔗 Estrutura do Webhook

Sua plataforma deve enviar dados no seguinte formato:

```json
{
    "paymentId": "uuid-do-pagamento",
    "status": "completed", // pending, completed, failed
    "transactionId": "id-da-transacao",
    "amount": 10.00,
    "method": "pix" // ou "bitcoin"
}
```

## 🎨 Customização

### Cores e Estilo
Edite o arquivo `public/style.css` para personalizar:
- Cores do tema
- Logo da empresa
- Estilos dos botões
- Layout responsivo

### Métodos de Pagamento
Para adicionar novos métodos, modifique:
1. `public/index.html` - Adicionar opções de radio
2. `public/script.js` - Lógica de exibição
3. `server.js` - Processamento no backend

## 🚀 Deploy

### Heroku
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login e criar app
heroku login
heroku create meu-webhook-app

# Deploy
git add .
git commit -m "Initial commit"
git push heroku main
```

### Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🔒 Segurança

- ✅ Validação de dados de entrada
- ✅ Sanitização de parâmetros
- ✅ Headers CORS configurados
- ⚠️ **TODO**: Autenticação de webhook
- ⚠️ **TODO**: Rate limiting
- ⚠️ **TODO**: HTTPS obrigatório

## 🐛 Troubleshooting

### Problemas Comuns

1. **QR Code não aparece**
   - Verifique se o valor e nome foram preenchidos
   - Confira o console do navegador para erros

2. **Webhook não funciona**
   - Certifique-se que a URL está acessível publicamente
   - Verifique os logs do servidor: `node server.js`

3. **Status não atualiza**
   - Verifique se sua plataforma está enviando webhooks
   - Confirme o formato dos dados recebidos

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Teste os endpoints com Postman
3. Consulte a documentação da sua plataforma de pagamento

## 📝 TODO

- [ ] Integração com banco de dados
- [ ] Autenticação de usuários
- [ ] Emails de confirmação
- [ ] Dashboard administrativo
- [ ] Relatórios de vendas
- [ ] Integração com múltiplas plataformas
