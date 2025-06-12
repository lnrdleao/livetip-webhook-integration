# QR Code Generation Fix for LiveTip Webhook Integration

## Problema Resolvido

Este documento descreve a solução implementada para corrigir o erro:

> "Erro ao gerar QR Code: Erro interno do servidor ao tentar gear um pagamento com pix."

O problema ocorria durante a integração com a API do LiveTip para geração de códigos PIX com o banco SEJAEFI.

## Correções Implementadas

### 1. Corrigido o caminho do módulo QRCodeWithLogo

O primeiro problema identificado foi que o servidor estava tentando importar `./qrCodeGenerator.js`, mas o arquivo estava localizado em `./tests/unit/generators/qrCodeGenerator.js`. Foi criado um arquivo wrapper para resolver este problema.

```javascript
// qrCodeGenerator.js
const QRCodeWithLogo = require('./tests/unit/generators/qrCodeGenerator');
module.exports = QRCodeWithLogo;
```

### 2. Melhorado o LiveTipService para gerar QR codes internamente

A classe LiveTipService agora gera o QR code diretamente quando recebe o código PIX da API, aumentando a confiabilidade do processo.

```javascript
// Gerar QR code do PIX diretamente aqui para evitar problemas no server.js
const qrCodeDataUrl = await qrCodeGenerator.generateWithLogo(pixCodeFromApi, 'pix');
```

### 3. Adicionado tratamento de erros robusto no server.js

Implementamos tratamento de erros mais preciso que fornece mensagens de erro específicas para diferentes situações:

```javascript
if (error.message && error.message.toLowerCase().includes('sejaefi')) {
    res.status(500).json({ 
        success: false,
        error: 'Erro ao gerar QR Code: Falha na comunicação com o banco SEJAEFI',
        // ...
    });
}
```

### 4. Adicionado verificação no server.js para QR codes já gerados

O servidor agora verifica se o QR code já foi gerado pelo LiveTipService antes de tentar gerá-lo novamente:

```javascript
if (!liveTipResponse.qrCodeImage) {
    try {
        console.log('🖼️ Gerando QR Code local para o código PIX da LiveTip...');
        liveTipResponse.qrCodeImage = await qrCodeGenerator.generateWithLogo(liveTipResponse.pixCode, 'pix');
        // ...
    }
}
```

## Testes Implementados

Foram criados dois arquivos de teste para validar as correções:

1. **test-qr-generation.js** - Testa a geração de QR codes para códigos PIX
2. **test-livetip-integration.js** - Testa o fluxo completo de integração com a API LiveTip

## Como Verificar a Correção

1. Execute o servidor usando o comando npm:
   ```
   npm run dev
   ```

2. Execute os testes de integração:
   ```
   node test-livetip-integration.js
   ```

3. Verifique os arquivos gerados:
   - `test-pix-qrcode.png` - QR code gerado para pagamento PIX
   - `test-btc-qrcode.png` - QR code gerado para pagamento Bitcoin
   - `test-api-qrcode.png` - QR code gerado pelo endpoint da API

## Notas Adicionais

- O sistema agora utiliza o módulo QRCodeWithLogo do diretório principal, que faz referência ao código original em `tests/unit/generators/qrCodeGenerator.js`
- Melhorias nas mensagens de erro para facilitar a depuração
- Tratamento adequado para integrações com o banco SEJAEFI através da API LiveTip

Este fix resolve o problema de geração de QR codes para pagamentos PIX e garante uma experiência mais confiável para os usuários.
