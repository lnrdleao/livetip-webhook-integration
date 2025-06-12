# Manual de Teste para Verificação das Correções PIX e Bitcoin

## 1. Preparação do Ambiente

1. Inicie o servidor LiveTip Webhook:
   ```
   npm run dev
   ```

2. Abra o navegador em `http://localhost:3000` (ou a porta configurada)

## 2. Teste do Pagamento PIX

### Passos:
1. No formulário de pagamento, selecione "PIX" como método de pagamento
2. Insira "Teste PIX" no campo de nome de usuário
3. Selecione R$ 1 como valor
4. Clique em "Gerar QR Code"

### Verificação:
- ✅ O QR code deve ser gerado sem erros
- ✅ Verifique se a mensagem "Erro ao gerar QR Code: Erro interno do servidor..." NÃO aparece

## 3. Teste do Pagamento Bitcoin

### Passos:
1. No formulário de pagamento, selecione "Bitcoin" como método de pagamento
2. Insira "Teste Bitcoin" no campo de nome de usuário
3. Digite "100" como valor (em Satoshis)
4. Clique em "Gerar QR Code"

### Verificação:
- ✅ O QR code deve ser gerado sem erros
- ✅ Verifique se a mensagem "Erro na requisição: paymentPollingInterval is not defined" NÃO aparece
- ✅ O status do pagamento deve mudar para "Aguardando pagamento..." e iniciar a verificação automática

## 4. Verificação do Console

1. Abra o Console do Navegador (F12)
2. Verifique se não há erros relacionados a:
   - QRCodeGenerator
   - paymentPollingInterval
   - Undefined variables

## 5. Monitoramento do Servidor

1. Observe a saída do console do servidor
2. Confirme que não há erros ao processar solicitações de QR code para PIX ou Bitcoin

## Conclusão

Se todos os testes passarem sem erros, as correções foram aplicadas com sucesso. Documente qualquer comportamento inesperado e reporte para desenvolvimento adicional se necessário.
