# LiveTip MVP - API Documentation

## Overview
This is a simplified MVP (Minimum Viable Product) for the LiveTip webhook integration system. It provides basic endpoints for PIX payment generation and webhook confirmation.

## Base URL
- Development: `http://localhost:3000`
- Production: `https://your-vercel-deployment-url.vercel.app`

## Authentication
The webhook endpoint requires token authentication using the header:
```
X-Livetip-Webhook-Secret-Token: 0ac7b9aa00e75e0215243f3bb177c844
```

## Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "total": 0
}
```

### Generate Payment
```
POST /generate
```

**Request Body:**
```json
{
  "nome": "User Name",
  "valor": 25
}
```

**Response:**
```json
{
  "success": true,
  "id": "PIX_1703876543210_abc123",
  "pix": "00020126BR.GOV.BCB.PIX01PIX_1703876543210_abc1235204000053039865802BR5925LIVETIPMVP6009SAOPAULO62070503***63044392",
  "status": "pending"
}
```

### Check Payment Status
```
GET /status/{id}
```

**Response:**
```json
{
  "id": "PIX_1703876543210_abc123",
  "status": "pending" // or "confirmed"
}
```

### Webhook for Payment Confirmation
```
POST /webhook
```

**Headers:**
```
X-Livetip-Webhook-Secret-Token: 0ac7b9aa00e75e0215243f3bb177c844
```

**Request Body:**
```json
{
  "id": "PIX_1703876543210_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "id": "PIX_1703876543210_abc123",
  "status": "confirmed"
}
```

## Error Responses

### Invalid Token
```json
{
  "error": "Token inválido"
}
```

### Invalid Payment ID
```json
{
  "error": "ID inválido"
}
```

### Payment Not Found
```json
{
  "error": "Pagamento não encontrado"
}
```

### Invalid JSON
```json
{
  "error": "JSON inválido"
}
```

### Missing Required Fields
```json
{
  "success": false,
  "error": "Nome e valor obrigatórios"
}
```

## Testing with cURL

### Generate Payment
```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test User", "valor": 25}'
```

### Check Status
```bash
curl http://localhost:3000/status/PIX_1703876543210_abc123
```

### Send Webhook
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-Livetip-Webhook-Secret-Token: 0ac7b9aa00e75e0215243f3bb177c844" \
  -d '{"id":"PIX_1703876543210_abc123"}'
```

## Integration Guide

1. Create a payment using the `/generate` endpoint
2. Display the PIX code to the user
3. Periodically check the payment status using the `/status/{id}` endpoint
4. When LiveTip confirms the payment, it will call your webhook endpoint
5. Update your UI to show the payment as confirmed

## Implementation Notes

- This MVP uses in-memory storage (Map) for simplicity
- For production, replace with a proper database
- The PIX code generation is a mock implementation
- In production, integrate with a real PIX provider
