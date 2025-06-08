# 🏦 GUIA: Teste PIX Real

## 🎯 **OBJETIVO**
Configurar suas credenciais PIX reais e fazer um teste de pagamento que você pode pagar de verdade.

## 📋 **PASSO A PASSO**

### **1. Configure suas credenciais PIX reais**
```powershell
# Execute o script de configuração:
.\setup-pix-real.ps1
```

**O script vai perguntar:**
- 🔑 **Sua chave PIX** (email, telefone, CPF ou chave aleatória)
- 👤 **Seu nome completo** (como aparece no banco)
- 🏙️ **Sua cidade**

**Exemplo de preenchimento:**
```
🔑 Sua chave PIX: leonardo@exemplo.com
👤 Seu nome completo: Leonardo Silva
🏙️ Sua cidade: São Paulo
```

### **2. Inicie o servidor com as configurações reais**
```powershell
# Se não iniciou automaticamente:
npm start
```

### **3. Execute o teste PIX real**
```powershell
# Execute o script de teste:
.\test-pix-real.ps1
```

**O script vai perguntar:**
- 👤 **Seu nome para o pagamento** (ex: "Leonardo Teste")
- 💰 **Valor do teste** (ex: "0.01" para 1 centavo)

### **4. Pague o PIX gerado**
1. 📱 **Abra seu app bancário**
2. 🔍 **Vá em PIX > Pagar com código**
3. 📋 **Cole o código PIX gerado**
4. ✅ **Confirme o pagamento**

## 🎯 **RESULTADO ESPERADO**

### ✅ **Código PIX Válido**
```
00020126580014br.gov.bcb.pix2536leonardo@exemplo.com5204000053039865802BR5914LEONARDO SILVA6009SAO PAULO62070503***6304XXXX
```

### ✅ **QR Code Visual**
- Acessível em: http://localhost:3001
- Escaneável por qualquer app bancário

### ✅ **Webhook Funcionando**
- Endpoint: http://localhost:3001/webhook
- Logs aparecem no terminal quando você pagar

## 🔧 **ARQUIVOS CRIADOS**

### **`.env`** (Suas credenciais reais)
```env
PIX_KEY=sua_chave_real
PIX_RECEIVER_NAME=SEU NOME REAL
PIX_CITY=SUA CIDADE
```

### **`pix-code-[ID].txt`** (Código PIX gerado)
```
00020126580014br.gov.bcb.pix...
```

## 🛡️ **SEGURANÇA**

- ✅ **Arquivo `.env` é privado** (não vai para Git)
- ✅ **Dados reais ficam apenas localmente**
- ✅ **Códigos PIX são válidos e seguros**
- ✅ **Webhook usa token secreto**

## 🧪 **TIPOS DE TESTE**

### **1. Teste Mínimo (1 centavo)**
```powershell
# Valor: 0.01
# Risco mínimo para testar funcionamento
```

### **2. Teste Real (valor baixo)**
```powershell
# Valor: 5.00
# Teste mais realista
```

### **3. Teste Completo**
```powershell
# Valor: qualquer
# Teste com valor que você usar em produção
```

## 📊 **MONITORAMENTO**

### **Logs do Servidor**
```
💰 Criando pagamento PIX para Leonardo Teste - R$ 0.01
✅ Pagamento PIX criado localmente
🔗 Webhook ativo em: http://localhost:3001/webhook
```

### **Interface Web**
- Status do pagamento em tempo real
- QR code visual
- Botão para copiar código PIX

### **Webhook**
- Recebe notificações quando você pagar
- Atualiza status automaticamente

## 🎉 **SUCESSO ESPERADO**

Após configurar e testar, você terá:

1. ✅ **Sistema PIX funcionando** com suas credenciais reais
2. ✅ **QR codes válidos** que podem ser pagos
3. ✅ **Webhook ativo** para receber notificações
4. ✅ **Interface moderna** para criar pagamentos
5. ✅ **Base pronta** para integração LiveTip

---

## 🚀 **COMANDOS RÁPIDOS**

```powershell
# 1. Configurar PIX real
.\setup-pix-real.ps1

# 2. Iniciar servidor
npm start

# 3. Testar pagamento
.\test-pix-real.ps1

# 4. Acessar interface
# http://localhost:3001
```

**Pronto para fazer seu primeiro PIX real! 🎯**
