# Documentação da API LiveTip para Pagamentos

Este documento contém as informações necessárias para integração com a API do LiveTip para geração de pagamentos via PIX e Bitcoin.

## Endpoints

### Gerar pagamento via PIX

**Endpoint:** `https://api.livetip.gg/api/v1/message/10`
- **Método:** POST
- **Autenticação:** Não exige token de autenticação
- **Body de exemplo:**
```json
{
  "sender": "joaozinho 123",
  "content": "muito bom esse app",
  "currency": "BRL",
  "amount": "10.00"
}
```
- **Resposta:** Código PIX em formato texto

### Gerar pagamento via Bitcoin

**Endpoint:** `https://api.livetip.gg/api/v1/message/10`
- **Método:** POST
- **Autenticação:** Não exige token de autenticação
- **Body de exemplo:**
```json
{
  "sender": "joaozinho 123",
  "content": "muito bom esse app",
  "currency": "BTC",
  "amount": "10.00"
}
```
- **Resposta:** JSON com Lightning Invoice no campo `code`

## Implementação

A forma mais simples de implementação para geração de QR codes segue as melhores práticas para sistemas de pagamento:

1. Para PIX:
   - Receber o código PIX da API
   - Gerar QR code a partir do código PIX
   - Exibir para o usuário tanto o QR code quanto o código PIX (para cópia manual)

2. Para Bitcoin:
   - Receber a Lightning Invoice da API
   - Gerar QR code a partir da Lightning Invoice
   - Exibir para o usuário o QR code e a Lightning Invoice

## Notas Importantes

- Ambos os endpoints utilizam a mesma URL (`/message/10`)
- A diferença está no campo `currency` (BRL para PIX, BTC para Bitcoin)
- A API retorna formatos diferentes para cada método:
  - PIX: Texto simples com o código PIX
  - Bitcoin: Objeto JSON com a Lightning Invoice no campo `code`

## Exemplo de Implementação no Sistema LiveTip

```javascript
// Exemplo de payload para PIX
const pixPayload = {
  sender: userName,
  content: message || "Pagamento via LiveTip",
  currency: "BRL",
  amount: amount.toString()
};

// Exemplo de payload para Bitcoin
const btcPayload = {
  sender: userName,
  content: message || "Pagamento Bitcoin via LiveTip",
  currency: "BTC",
  amount: amount.toString()
};

// Endpoint comum
const apiUrl = "https://api.livetip.gg/api/v1/message/10";
```

Estes endpoints e formatos de payload são utilizados no arquivo `liveTipService.js` para as integrações com a API LiveTip.
