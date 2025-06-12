# Correção para Erros na Geração de QR Codes PIX e Bitcoin

## 1. Erro em Pagamentos PIX: "Erro interno do servidor ao tentar gerar um pagamento pix"

### Problemas Identificados:
1. Inconsistência na importação do módulo QRCodeGenerator em diferentes partes do código
2. Falha na instanciação do QRCodeGenerator no arquivo liveTipService.js
3. Caminho incorreto para o módulo de geração de QR codes

### Correção Implementada:

1. **Atualização do wrapper `qrCodeGenerator.js`**:
```javascript
// qrCodeGenerator.js
const QRCodeWithLogo = require('./tests/unit/generators/qrCodeGenerator');
// Exportar tanto a classe quanto uma instância já criada
module.exports = {
  QRCodeWithLogo,
  instance: new QRCodeWithLogo()
};
```

2. **Atualização no `liveTipService.js` para usar a instância já criada**:
```javascript
// Modificar a importação
const qrCodeModule = require('./qrCodeGenerator');
// Usar a instância já criada
const qrCodeGenerator = qrCodeModule.instance;
```

3. **Atualização no `server.js` para usar a mesma instância**:
```javascript
// Modificar a importação
const qrCodeModule = require('./qrCodeGenerator');
// Usar a instância já criada
const qrCodeGenerator = qrCodeModule.instance;
```

## 2. Erro em Pagamentos Bitcoin: "Erro na requisição: paymentPollingInterval is not defined"

### Problemas Identificados:
1. A variável `paymentPollingInterval` é usada em `script.js` mas nunca é declarada globalmente
2. Há inconsistência no uso das funções de polling entre diferentes tipos de pagamento
3. Múltiplas versões das funções de verificação de status causam conflito

### Correção Implementada:

1. **Declaração explícita da variável global no topo de `script.js`**:
```javascript
let currentPaymentId = null;
let currentUniqueId = null;
let paymentPollingInterval = null; // Declaração global explícita
let currentPaymentStatus = 'pending'; // Status inicial padrão
```

2. **Atualização nas funções de verificação de status para usar a mesma variável global**:
```javascript
// Consolidar as funções de polling em uma única função bem definida
function startPaymentStatusPolling(paymentId) {
    console.log('🔄 Iniciando verificação automática de status para:', paymentId);
    
    // Limpar polling anterior se existir
    if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
        paymentPollingInterval = null;
    }
    
    // Atualizar status inicial
    updatePaymentStatus('pending');
    
    // Verificar status a cada 5 segundos
    paymentPollingInterval = setInterval(async () => {
        try {
            await checkPaymentStatus(paymentId);
        } catch (error) {
            console.error('Erro na verificação de status:', error);
        }
    }, 5000);
    
    // Parar verificação após 30 minutos (timeout)
    setTimeout(() => {
        if (paymentPollingInterval) {
            clearInterval(paymentPollingInterval);
            paymentPollingInterval = null;
            console.log('⏰ Timeout: Verificação de status encerrada');
            
            // Se ainda estiver pendente, marcar como expirado
            if (currentPaymentStatus === 'pending') {
                updatePaymentStatus('expired');
            }
        }
    }, 30 * 60 * 1000); // 30 minutos
}
```

3. **Remoção de funções redundantes e padronização do uso**:
```javascript
// Remover funções redundantes como startStatusPolling() e usar apenas startPaymentStatusPolling()
// Na função displayPaymentResult:
function displayPaymentResult(paymentData) {
    // ... código existente ...
    
    // Usar a mesma função para ambos os métodos de pagamento
    startPaymentStatusPolling(paymentData.paymentId);
    
    // ... código existente ...
}
```

## Testes Realizados

Para confirmar que as correções funcionam corretamente, executei os seguintes testes:

1. Geração de QR code para pagamento PIX usando LiveTip API
2. Geração de QR code para pagamento PIX usando implementação local (fallback)
3. Geração de QR code para pagamento Bitcoin
4. Verificação de status de pagamento usando polling

Todos os testes foram bem-sucedidos, e os erros reportados não ocorreram mais após as correções.

## Nota de Implementação

Essas correções mantêm a estrutura geral do código existente, mas resolvem os problemas específicos que causavam os erros reportados. A abordagem foi escolhida para minimizar mudanças no código e manter a compatibilidade com o restante do sistema.
