# 🚀 DEPLOY VERCEL - PASSO A PASSO

## 📍 **Status Atual**
✅ Repositório GitHub: https://github.com/lnrdleao/livetip-webhook-integration  
✅ Código atualizado e enviado  
✅ Configurações Vercel prontas  

## 🎯 **DEPLOY EM 5 PASSOS SIMPLES**

### **PASSO 1: Acesse a Vercel**
1. Abra: https://vercel.com
2. Clique em **"Sign Up"** ou **"Login"**
3. Escolha **"Continue with GitHub"**
4. Autorize a Vercel a acessar seus repositórios

### **PASSO 2: Criar Novo Projeto**
1. No Dashboard da Vercel, clique em **"New Project"**
2. Na seção "Import Git Repository"
3. Procure por: **"livetip-webhook-integration"**
4. Clique em **"Import"** no repositório encontrado

### **PASSO 3: Configurar Deploy**
Na tela de configuração:

```
Project Name: livetip-webhook-integration
Framework Preset: Other
Root Directory: ./
Build Command: npm run build
Output Directory: (deixe vazio)
Install Command: npm install
```

### **PASSO 4: Variáveis de Ambiente**
Clique em **"Environment Variables"** e adicione:

```
PIX_KEY = sua@chave.pix
PIX_RECEIVER_NAME = SEU NOME
PIX_CITY = SUA CIDADE
LIVETIP_USERNAME = seu_usuario
LIVETIP_PASSWORD = sua_senha
WEBHOOK_SECRET = 37de1854e9469607092124ed015c1f91
API_URL = https://api.livetip.gg/api/v1
NODE_ENV = production
```

### **PASSO 5: Deploy**
1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. 🎉 **Deploy concluído!**

## 🌐 **URLs Resultantes**

Após o deploy você terá:

- **🏠 App Principal:** `https://livetip-webhook-integration.vercel.app`
- **🔗 Webhook URL:** `https://livetip-webhook-integration.vercel.app/webhook`
- **💚 Health Check:** `https://livetip-webhook-integration.vercel.app/health`

## ✅ **Verificação do Deploy**

Teste se tudo funcionou:

1. **Interface Web:**
   - Acesse a URL principal
   - Teste formulário PIX
   - Teste formulário Bitcoin

2. **API Endpoints:**
   ```bash
   # Health Check
   curl https://sua-app.vercel.app/health
   
   # Teste PIX
   curl -X POST https://sua-app.vercel.app/generate-qr \
     -H "Content-Type: application/json" \
     -d '{"userName":"Teste","paymentMethod":"pix","amount":10}'
   ```

## 🔧 **Configuração LiveTip**

Após o deploy, configure na LiveTip:

1. **Webhook URL:** `https://sua-app.vercel.app/webhook`
2. **Secret Token:** `37de1854e9469607092124ed015c1f91`

## 🎯 **Próximos Passos**

1. ✅ **Deploy concluído**
2. ⏳ **Configurar webhook na LiveTip**
3. ⏳ **Testar pagamentos reais**
4. ⏳ **Monitorar logs de produção**

## 🆘 **Problemas Comuns**

### **Build Failed**
- Verifique se todas as dependências estão no `package.json`
- Confirme se não há erros de sintaxe

### **Environment Variables**
- Certifique-se de configurar todas as variáveis obrigatórias
- Não inclua espaços extras nos valores

### **404 Not Found**
- Verifique se o `vercel.json` está no root do projeto
- Confirme as rotas configuradas

## 📞 **Suporte**

- **Documentação Vercel:** https://vercel.com/docs
- **GitHub Issues:** https://github.com/lnrdleao/livetip-webhook-integration/issues

---

**🚀 Deploy na Vercel - Simples e Rápido!**
**⚡ Powered by LiveTip Lightning Network**
