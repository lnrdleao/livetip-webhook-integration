# 🚀 Como Usar a Aplicação LiveTip Webhook

## 📋 Resumo das Informações Necessárias

Baseado nas informações do webhook do LiveTip, aqui está o que você precisa configurar:

### 🔑 Informações Essenciais para Integração

#### 1. **Token Secreto do LiveTip**
- **Token atual**: `2400613d5c2fb33d76e76c298d1dab4c`
- **Onde usar**: Header `X-Livetip-Webhook-Secret-Token`
- **Já configurado**: ✅ Sim, no código

#### 2. **URL do Webhook**
- **Para desenvolvimento**: `http://localhost:3000/webhook`
- **Para produção**: `https://seu-dominio.com/webhook`
- **Configurar em**: http://livetip.gg (seção Configurar Webhook)

#### 3. **Informações PIX** (Opcional - para QR codes próprios)
- **Chave PIX**: Sua chave (email, telefone, CPF)
- **Nome do recebedor**: Nome que aparece no PIX
- **Atual**: `usuario@exemplo.com` (altere no `config.js`)

#### 4. **Endereço Bitcoin** (Opcional - para QR codes próprios)
- **Endereço**: Sua carteira Bitcoin
- **Atual**: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` (altere no `config.js`)

## 🎯 Próximos Passos

### 1. **Configurar suas Informações Reais**

Edite o arquivo `config.js`:

```javascript
// Suas informações PIX
pix: {
    key: 'seu-email@exemplo.com', // ou telefone: '+5511999999999'
    receiverName: 'SEU NOME COMPLETO',
    city: 'SUA CIDADE'
},

// Sua carteira Bitcoin
bitcoin: {
    address: 'seu-endereco-bitcoin-real',
    network: 'mainnet'
}
```

### 2. **Configurar no LiveTip**

1. Acesse: http://livetip.gg
2. Vá para **"Configurar Webhook"**
3. Configure:
   - ✅ **Ativar Webhook**: Sim
   - 🌐 **URL de destino**: `https://seu-dominio.com/webhook`
   - 🔑 **Token secreto**: `2400613d5c2fb33d76e76c298d1dab4c`

### 3. **Deploy para Produção**

Para colocar online, você precisa:

#### Opção A: Heroku (Gratuito/Pago)
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login e criar app
heroku login
heroku create meu-livetip-webhook

# Configurar variáveis
heroku config:set WEBHOOK_SECRET=2400613d5c2fb33d76e76c298d1dab4c
heroku config:set PIX_KEY=seu-email@exemplo.com

# Deploy
git add .
git commit -m "Deploy LiveTip webhook"
git push heroku main
```

#### Opção B: Vercel (Gratuito)
```bash
npm install -g vercel
vercel --prod
```

#### Opção C: Seu próprio servidor
- Configure NGINX/Apache
- Instale Node.js
- Configure PM2 para manter rodando
- Configure HTTPS (obrigatório para webhooks)

### 4. **Testar a Integração**

1. **Teste local**: A aplicação já está funcionando em `http://localhost:3000`
2. **Teste o webhook**: Use o comando abaixo para simular um pagamento do LiveTip

```bash
# Testar webhook localmente
node test-webhook.js
```

3. **Teste real**: Faça um pagamento através do LiveTip e veja se o webhook é recebido

## 🔍 Como Funciona

### Fluxo Completo:

1. **Cliente acessa sua página** → `http://localhost:3000`
2. **Cliente preenche dados** → Nome e valor do pagamento  
3. **Sistema gera QR Code** → PIX ou Bitcoin
4. **Cliente efetua pagamento** → Através do LiveTip
5. **LiveTip confirma pagamento** → Envia webhook para sua aplicação
6. **Sua aplicação recebe webhook** → Atualiza status para "pago"
7. **Cliente vê confirmação** → Na página web

### Estrutura do Webhook do LiveTip:
```json
{
  "event": "payment_confirmed",
  "payment": {
    "sender": "nome_do_usuario",
    "receiver": "seu_recebedor", 
    "content": "descrição do pagamento",
    "amount": 25.50,
    "currency": "BRL",
    "timestamp": "2025-05-28T12:30:00.000Z",
    "paid": true,
    "paymentId": "lt_pay_abc123",
    "read": true
  }
}
```

## 🎨 Personalização

### Alterar Visual
- Edite `public/style.css` para mudar cores e layout
- Edite `public/index.html` para mudar textos
- Adicione seu logo/marca

### Adicionar Funcionalidades
- Banco de dados (MySQL, PostgreSQL, MongoDB)
- Emails de confirmação
- Dashboard administrativo
- Relatórios de vendas
- Integração com outros sistemas

## 🆘 Problemas Comuns

### ❌ "Webhook não é recebido"
- ✅ Verifique se a URL está acessível publicamente
- ✅ Confirme se o webhook está ativado no LiveTip
- ✅ Teste com `curl` ou Postman

### ❌ "Token inválido" 
- ✅ Verifique o token no LiveTip
- ✅ Confirme que não há espaços extras
- ✅ Verifique a variável de ambiente

### ❌ "Pagamento não encontrado"
- ✅ Verifique se os valores coincidem
- ✅ Analise os logs do servidor
- ✅ Considere implementar ID único

## 📞 Suporte

- **Código**: Verifique os logs em `console.log`
- **LiveTip**: Suporte através do site http://livetip.gg
- **Deploy**: Documentação das plataformas (Heroku, Vercel, etc.)

## ✅ Checklist Final

- [ ] Configurei minhas informações PIX/Bitcoin reais
- [ ] Testei a aplicação localmente
- [ ] Fiz deploy para produção
- [ ] Configurei webhook no LiveTip com URL de produção
- [ ] Testei pagamento real
- [ ] Webhook está sendo recebido corretamente
- [ ] Status do pagamento atualiza na página

Agora você tem tudo configurado para receber pagamentos via LiveTip! 🎉
