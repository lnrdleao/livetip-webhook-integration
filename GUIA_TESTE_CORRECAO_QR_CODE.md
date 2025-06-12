# Guia de Teste da Correção de QR Code - LiveTip Webhook Integration

**Data:** 12 de junho de 2025

## 1. Resumo

Este guia explica como testar a correção para o problema de geração de QR code na plataforma LiveTip Webhook Integration. A correção implementa um sistema de fallback que permite a geração de QR codes tanto no ambiente local quanto no ambiente de produção (serverless).

## 2. Testes Locais

### 2.1. Testar o módulo de fallback

Execute o script de teste específico:

```powershell
npm run test:qr-fallback
```

Isso verificará se o sistema consegue gerar QR codes mesmo quando o módulo `canvas` não está disponível.

### 2.2. Testar o servidor completo

Inicie o servidor:

```powershell
npm run start
```

Acesse o sistema via navegador:

```
http://localhost:3001
```

Tente gerar um QR code de pagamento para verificar o funcionamento correto.

### 2.3. Testar via API

Para testar diretamente a API de geração de QR code:

```powershell
$body = @{
    userName = "TesteLocal"
    paymentMethod = "pix"
    amount = 2
    uniqueId = "PIX_TEST_LOCAL"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/generate-qr" -Method POST -ContentType "application/json" -Body $body
```

O resultado deve incluir um QR code gerado com sucesso.

## 3. Deploy para Produção

### 3.1. Preparação

Certifique-se de que todas as alterações foram testadas localmente.

### 3.2. Deploy

Execute o script de deploy:

```powershell
./deploy-qr-code-fix.ps1
```

O script irá:
1. Limpar caches desnecessários
2. Executar testes locais
3. Gerar build de produção
4. Fazer deploy para o Vercel
5. Testar o funcionamento em produção

### 3.3. Verificação Pós-Deploy

Após o deploy, acesse o sistema em produção:

```
https://livetip-webhook-integration.vercel.app
```

Teste a geração de QR codes tanto para PIX quanto para Bitcoin.

## 4. Solução de Problemas

### 4.1. QR Code não é exibido

- Verifique se o módulo `qrCodeGenerator.js` está usando o fallback corretamente
- Inspecione o console do navegador para verificar se a URL do QR code está sendo recebida
- Verifique os logs do servidor para identificar possíveis erros

### 4.2. Erro no Deploy

Em caso de erro durante o deploy:

1. Verifique se todas as dependências estão instaladas corretamente
2. Limpe os caches locais e da plataforma de deploy
3. Verifique as variáveis de ambiente necessárias
