# Correção do Formato de Códigos PIX - Documentação Técnica
**Data:** 12 de junho de 2025  
**Autor:** Equipe de Desenvolvimento LiveTip

## Descrição do Problema

O sistema LiveTip Webhook Integration estava enfrentando um problema no formato dos códigos PIX retornados pela API. A API começou a retornar os códigos PIX no formato JSON:

```json
{"code":"00020101021226830014BR.GOV.BCB.PIX2561qrcodespix.sejaefi.com.br/v2/bcd7b953f8314d399c93144314acca265204000053039865802BR5905EFISA6008SAOPAULO62070503***63045A62","id":"684adeb9ac3ea7ede00e1aee"}
```

Quando o esperado era receber apenas o código PIX em texto puro:

```
00020101021226830014BR.GOV.BCB.PIX2561qrcodespix.sejaefi.com.br/v2/bcd7b953f8314d399c93144314acca265204000053039865802BR5905EFISA6008SAOPAULO62070503***63045A62
```

Isso estava causando falhas na geração dos QR Codes, pois o QR code estava sendo gerado com o JSON inteiro em vez de apenas o código PIX.

## Solução Implementada

A solução implementada foi modificar o arquivo `liveTipService.js` para tratar adequadamente ambos os formatos de resposta da API:

1. **Obter a resposta como texto bruto** em vez de assumir que é um formato específico
2. **Tentar analisar como JSON** para verificar se a resposta está no novo formato
3. **Extrair apenas o campo "code"** se a resposta for um objeto JSON válido com esse campo
4. **Manter a resposta original** se não for JSON ou não tiver o campo "code"

Código da solução:

```javascript
// A API pode retornar texto ou JSON, vamos tentar processar ambos
const responseText = await response.text();
console.log('✅ Resposta da API LiveTip:', responseText);

// Tenta verificar se a resposta é um JSON válido
let pixCodeFromApi;
try {
    const jsonResponse = JSON.parse(responseText);
    // Se for JSON e tiver campo 'code', usamos esse campo
    if (jsonResponse && jsonResponse.code) {
        pixCodeFromApi = jsonResponse.code;
        console.log('✅ Código PIX extraído do JSON:', pixCodeFromApi);
    } else {
        // JSON sem campo code - usar a string completa
        pixCodeFromApi = responseText;
    }
} catch (e) {
    // Não é JSON - usar a string completa como código PIX
    pixCodeFromApi = responseText;
    console.log('✅ Código PIX em formato texto puro');
}
```

## Testes Realizados

### 1. Teste de Formato do Código PIX
- Script: `teste-formato-pix.js`
- Propósito: Verifica se o código PIX está sendo retornado como texto puro em vez de JSON
- Resultado: ✅ SUCESSO - O código PIX está sendo extraído corretamente do objeto JSON

### 2. Verificação Local Completa
- Script: `local-verification.js`
- Propósito: Testa o fluxo completo de pagamentos PIX e Bitcoin
- Resultado: ✅ SUCESSO - Ambos os métodos de pagamento estão funcionando corretamente

### 3. Testes de Produção
- Script: `monitor-pix-format-production.js`
- Propósito: Verificar se a correção está funcionando em produção após o deploy
- Status: Pendente de execução após o deploy

## Principais Arquivos Modificados

1. **liveTipService.js**
   - Modificado para lidar com respostas da API em formato JSON ou texto puro
   - Implementada a lógica para extrair o código PIX do campo "code" quando a resposta é JSON

2. **config.js**
   - Corrigido o formato e indentação
   - Atualizado o URL base da API de 'https://api.livetip.gg/v1' para 'https://api.livetip.gg/api/v1'

## Processo de Deploy

O deploy da correção segue estas etapas:

1. Executar testes finais localmente para confirmar que a correção funciona
2. Fazer backup dos arquivos atuais
3. Atualizar a documentação do projeto
4. Commit das alterações no repositório Git
5. Push para o GitHub
6. Deploy para produção na Vercel
7. Validação em produção usando o script de monitoramento

## Monitoramento Pós-Deploy

Após o deploy, é necessário executar o script `monitor-pix-format-production.js` para verificar se a correção está funcionando corretamente em produção. Este script:

1. Faz uma requisição para criar um pagamento PIX no ambiente de produção
2. Verifica se o código PIX retornado está no formato correto (texto puro)
3. Verifica se o código PIX segue o padrão EMV esperado
4. Reporta o resultado da validação

## Considerações Futuras

- Implementar monitoramento contínuo do formato dos códigos PIX
- Adicionar testes automatizados para verificar o formato dos códigos PIX em cada deploy
- Manter comunicação com a equipe da API LiveTip para estar ciente de futuras mudanças no formato das respostas
