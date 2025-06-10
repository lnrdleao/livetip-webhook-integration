# 🧪 GUIA DE TESTE LOCAL

## 🚀 SERVIDOR LOCAL ATIVO
- ✅ **URL**: http://localhost:3001
- ✅ **Status**: Online e funcionando
- ✅ **Porta**: 3001
- ✅ **API Health**: Respondendo corretamente

## 📋 COMO TESTAR LOCALMENTE

### 1️⃣ **INTERFACE WEB (RECOMENDADO)**
```
🌐 Abra: http://localhost:3001
```

**Teste PIX:**
1. Selecione "PIX" como método de pagamento
2. Digite seu nome (ex: "João Teste")
3. Clique em um dos botões: **R$ 1**, **R$ 2**, **R$ 3**, ou **R$ 4**
4. Clique em "Gerar QR Code"
5. ✅ Deve aparecer QR Code PIX válido

**Teste Bitcoin:**
1. Selecione "Bitcoin" como método de pagamento
2. Digite seu nome (ex: "Maria Teste")
3. Clique em um dos botões: **100**, **200**, **300**, ou **400** sats
4. Clique em "Gerar QR Code"
5. ✅ Deve aparecer Lightning Invoice válida

### 2️⃣ **TESTE VIA CURL (TERMINAL)**

**PIX R$ 2:**
```bash
curl -X POST http://localhost:3001/generate-qr \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Teste Local",
    "paymentMethod": "pix",
    "amount": 2,
    "uniqueId": "PIX_TEST_123"
  }'
```

**Bitcoin 200 sats:**
```bash
curl -X POST http://localhost:3001/generate-qr \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Teste Local",
    "paymentMethod": "bitcoin",
    "amount": 200,
    "uniqueId": "BTC_TEST_123"
  }'
```

### 3️⃣ **TESTE VIA POSTMAN/INSOMNIA**

**Endpoint:** `POST http://localhost:3001/generate-qr`

**Headers:**
```
Content-Type: application/json
```

**Body PIX:**
```json
{
  "userName": "Seu Nome",
  "paymentMethod": "pix",
  "amount": 3,
  "uniqueId": "PIX_POSTMAN_123"
}
```

**Body Bitcoin:**
```json
{
  "userName": "Seu Nome", 
  "paymentMethod": "bitcoin",
  "amount": 300,
  "uniqueId": "BTC_POSTMAN_123"
}
```

## ✅ RESULTADOS ESPERADOS

### **PIX (R$ 1, 2, 3, 4):**
```json
{
  "success": true,
  "data": {
    "paymentId": "pix_2_1749526789123",
    "userName": "Teste Local",
    "amount": 2,
    "method": "pix",
    "pixCode": "00020101021226430014BR.GOV.BCB.PIX...",
    "qrCodeImage": "https://api.qrserver.com/v1/create-qr-code/...",
    "source": "fallback-local-fixed"
  }
}
```

### **Bitcoin (100, 200, 300, 400 sats):**
```json
{
  "success": true,
  "data": {
    "paymentId": "btc_200_1749526789456",
    "userName": "Teste Local",
    "amount": 200,
    "method": "bitcoin", 
    "lightningInvoice": "lnbc200n1...",
    "qrCodeImage": "https://api.qrserver.com/v1/create-qr-code/...",
    "source": "fallback-local-fixed"
  }
}
```

## 🔍 MONITORAMENTO

### **Logs do Servidor:**
- Verifique o terminal onde rodou `npm run dev`
- Logs em tempo real de cada requisição
- Informações de debug sobre geração de códigos

### **Endpoints de Debug:**
```
GET  http://localhost:3001/health
GET  http://localhost:3001/monitor
GET  http://localhost:3001/docs
```

## ⚠️ VALIDAÇÕES IMPLEMENTADAS

### **PIX - Valores Permitidos:**
- ✅ R$ 1, 2, 3, 4 → Aceitos
- ❌ R$ 5, 10, 25 → Rejeitados (400 Bad Request)

### **Bitcoin - Qualquer Valor:**
- ✅ Qualquer valor em satoshis aceito
- ✅ Mínimo: 1 satoshi

### **Campos Obrigatórios:**
- ✅ `userName` - Nome do usuário
- ✅ `paymentMethod` - "pix" ou "bitcoin"
- ✅ `amount` - Valor numérico
- ✅ `uniqueId` - Identificador único (opcional)

## 🎯 FUNCIONALIDADES TESTÁVEIS

1. **✅ Geração PIX EMV** - Códigos válidos padrão Banco Central
2. **✅ Lightning Invoices** - Formato BOLT11 compatível
3. **✅ QR Code URLs** - Imagens geradas automaticamente
4. **✅ Validação Input** - Rejeita valores inválidos
5. **✅ Histórico Unificado** - PIX + Bitcoin na mesma tabela
6. **✅ Export CSV** - Exportação de dados
7. **✅ Interface Responsiva** - Design moderno
8. **✅ Fallback Local** - Funciona mesmo offline

## 🌐 ACESSO RÁPIDO
- **Interface**: http://localhost:3001
- **Health**: http://localhost:3001/health
- **Monitor**: http://localhost:3001/monitor

---

**💡 Dica**: Use F12 no navegador para ver logs do JavaScript e debug da interface em tempo real!
