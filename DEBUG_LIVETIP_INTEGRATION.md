# 🔍 DEBUG: INTEGRAÇÃO LIVETIP API 

## Status da Investigação

**Data:** 10/06/2025 01:01  
**Problema:** Endpoint `/generate-qr` sempre cai no fallback, mesmo com API LiveTip funcionando  
**API LiveTip Status:** ✅ FUNCIONANDO (Status 201)  
**Nossa Integração:** ❌ Caindo no fallback  

## Testes Realizados

### ✅ API LiveTip Direta
```powershell
POST https://api.livetip.gg/api/v1/message/10
{
  "sender": "Teste Direto 2",
  "content": "teste pagamento 2", 
  "currency": "BRL",
  "amount": "25.00"
}

# Resultado: Status 201 ✅
# Response: {"pix":"00020126580014BR.GOV.BCB.PIX...","id":"..."}
```

### ❌ Nossa Integração Serverless  
```powershell
POST https://livetip-webhook-integration.vercel.app/generate-qr
{
  "userName": "João Teste HTTPS",
  "paymentMethod": "pix",
  "amount": 25.00
}

# Resultado: Status 200 mas usando fallback
# Response: {"source": "fallback-local", "error": "LiveTip API indisponível"}
```

## Possíveis Causas

1. **Timeout Vercel**: Serverless functions podem ter timeout menor
2. **Headers HTTP**: Diferenças nos headers entre PowerShell e Node.js
3. **TLS/SSL**: Problemas de certificado no ambiente serverless  
4. **Rate Limiting**: API pode estar bloqueando requests do Vercel
5. **Proxy/Firewall**: Vercel pode estar bloqueado pela LiveTip
6. **Error Handling**: Nossa função pode estar capturando erros incorretamente

## Próximos Passos

1. ✅ Adicionar timeout maior na requisição HTTPS
2. ✅ Melhorar logs de debug para capturar o erro exato
3. ✅ Testar com headers idênticos ao PowerShell  
4. ✅ Verificar se é problema de DNS/conectividade
5. ✅ Implementar retry logic
6. ✅ Adicionar user-agent específico

## Status
🔍 **INVESTIGANDO** - API funciona externamente, problema na integração serverless
