# Verificação Manual do Formato do Código PIX

## Objetivo
Este documento descreve como verificar manualmente se o formato do código PIX está correto após a implantação da correção.

## Passos para Verificação

### 1. Verificação Local

1. Execute o servidor local:
   ```
   npm run dev
   ```

2. Execute o script de teste de formato PIX:
   ```
   node teste-formato-pix.js
   ```

3. Verifique se o resultado indica "SUCESSO: Código PIX está no formato correto (texto puro)!"

4. Execute a verificação local completa:
   ```
   node local-verification.js
   ```

5. Confirme que o relatório final mostra "PIX Fix Status: ✅ FIXED"

### 2. Verificação em Produção

1. Acesse a URL de produção:
   [https://livetip-webhook-integration.vercel.app/webhook-monitor](https://livetip-webhook-integration.vercel.app/webhook-monitor)

2. Gere um pagamento PIX de teste (botão "Gerar Pagamento" ou equivalente)

3. Quando o código PIX for exibido, inspecione-o:
   - Deve começar com "00020101..." (formato EMV)
   - Não deve estar envolto em `{ }` (não deve ser JSON)
   - Deve ter mais de 50 caracteres

4. Verifique se o QR Code foi gerado corretamente:
   - QR Code deve ser exibido sem erros
   - Ao escanear com um app bancário, deve reconhecer como um código PIX válido

### 3. O que fazer se encontrar problemas

Se o código PIX ainda estiver sendo retornado como JSON:

1. Verifique se o deploy da correção foi bem-sucedido:
   ```
   vercel logs livetip-webhook-integration
   ```

2. Confirme que a versão correta do código está implantada:
   - Verifique `liveTipService.js` no servidor
   - Confirme que contém o bloco de código de extração do campo `code`

3. Se necessário, faça o rollback para a versão anterior e aplique a correção novamente:
   ```
   cd "c:\Users\Leonardo\OneDrive\Área de Trabalho\LiveTip\Página Pagto Test"
   vercel rollback
   ```

4. Após corrigir, faça um novo deploy e teste novamente:
   ```
   vercel --prod
   ```

## Cronograma de Verificação

Para garantir que a correção continue funcionando:

- **Diariamente:** Executar verificação local uma vez ao dia
- **Semanalmente:** Executar verificação em produção
- **Após atualizações da API:** Verificar novamente ambos os ambientes

## Notas Importantes

- O formato correto do código PIX é texto puro, não JSON
- O código PIX válido começa com `00020101` ou `00020126`
- Se a API LiveTip mudar novamente o formato da resposta, pode ser necessário ajustar a lógica de extração

---

**Última verificação:** 12/06/2025  
**Status:** ✅ Funcionando corretamente
