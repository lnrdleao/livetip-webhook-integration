# 🚀 Deploy na Vercel - Guia Completo

## 📋 **Métodos de Deploy**

### 🔗 **Método 1: Via GitHub (Recomendado)**

1. **Acesse a Vercel:**
   - Vá para https://vercel.com
   - Faça login com sua conta GitHub

2. **Conecte o Repositório:**
   - Clique em "New Project"
   - Selecione "Import Git Repository"
   - Escolha: `lnrdleao/livetip-webhook-integration`

3. **Configure o Deploy:**
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** (deixe vazio)
   - **Install Command:** `npm install`

### ⚙️ **Variáveis de Ambiente**

Configure as seguintes variáveis na Vercel:

```env
# PIX Configuration
PIX_KEY=sua@chave.pix
PIX_RECEIVER_NAME=SEU NOME
PIX_CITY=SUA CIDADE

# LiveTip Credentials  
LIVETIP_USERNAME=seu_usuario
LIVETIP_PASSWORD=sua_senha
WEBHOOK_SECRET=seu_webhook_secret
API_URL=https://api.livetip.gg/api/v1

# Environment
NODE_ENV=production
```

### 🌐 **Método 2: Via CLI**

Se preferir usar a CLI da Vercel:

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar domínio (opcional)
vercel domains add seu-dominio.com
```

## 📱 **URLs Resultantes**

Após o deploy, você terá:

- **App URL:** `https://livetip-webhook-integration.vercel.app`
- **Webhook URL:** `https://livetip-webhook-integration.vercel.app/webhook`
- **Health Check:** `https://livetip-webhook-integration.vercel.app/health`

## 🔧 **Configurações Automáticas**

O projeto já inclui:

✅ **vercel.json** configurado  
✅ **package.json** com scripts de build  
✅ **Roteamento automático**  
✅ **Funções serverless prontas**  
✅ **Variáveis de ambiente suportadas**  

## 📊 **Verificação do Deploy**

Após o deploy, teste:

1. **Interface Principal:**
   ```
   GET https://sua-app.vercel.app/
   ```

2. **Health Check:**
   ```
   GET https://sua-app.vercel.app/health
   ```

3. **Webhook Endpoint:**
   ```
   POST https://sua-app.vercel.app/webhook
   ```

## 🎯 **Próximos Passos**

1. **Deploy na Vercel** ✅
2. **Configurar variáveis de ambiente** 
3. **Testar interface web**
4. **Configurar webhook na LiveTip**
5. **Testar pagamentos reais**

## 🔗 **Links Úteis**

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Documentação:** https://vercel.com/docs
- **Repositório:** https://github.com/lnrdleao/livetip-webhook-integration

---

**🚀 Projeto pronto para deploy imediato na Vercel!**
