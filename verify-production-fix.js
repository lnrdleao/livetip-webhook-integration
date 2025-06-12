/**
 * Verificação de correção do formato PIX na produção
 * Este script acessa a página de webhook monitor da produção e verifica se os códigos PIX estão formatados corretamente
 */

const puppeteer = require('puppeteer');

async function verifyProductionFix() {
  console.log('🔍 VERIFICANDO CORREÇÃO DO FORMATO PIX NA PRODUÇÃO');
  console.log('=====================================================');
  console.log(`Data: ${new Date().toLocaleString()}`);

  try {
    // Iniciar navegador headless
    console.log('\n🌐 Iniciando navegador para acessar a produção...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Acessar página de webhook monitor na produção
    console.log('🔗 Acessando página de webhook monitor...');
    await page.goto('https://livetip-webhook-integration.vercel.app/webhook-monitor', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Aguardar carregamento da página
    await page.waitForSelector('button', { timeout: 10000 });
    console.log('✅ Página carregada com sucesso!');
    
    // Verificar se há botão para gerar pagamento PIX
    const hasPixButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(button => 
        button.textContent.toLowerCase().includes('pix') || 
        button.textContent.toLowerCase().includes('pagamento')
      );
    });
    
    if (hasPixButton) {
      console.log('🔘 Botão de pagamento PIX encontrado, gerando pagamento para teste...');
      
      // Clicar no botão para gerar pagamento PIX
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const pixButton = buttons.find(button => 
          button.textContent.toLowerCase().includes('pix') || 
          button.textContent.toLowerCase().includes('pagamento')
        );
        if (pixButton) pixButton.click();
      });
      
      // Aguardar geração do código PIX (pode ser em modal ou na própria página)
      console.log('⏳ Aguardando geração do código PIX...');
      await page.waitForTimeout(3000); // Aguardar 3 segundos para processamento
      
      // Capturar screenshot para verificação visual
      await page.screenshot({ path: 'production-pix-verification.png' });
      console.log('📸 Screenshot salvo como production-pix-verification.png');
      
      // Verificar o formato do código PIX na página
      const pixCodeResult = await page.evaluate(() => {
        // Buscar elementos que possam conter o código PIX
        const possibleElements = [
          // Por texto
          ...Array.from(document.querySelectorAll('pre')),
          ...Array.from(document.querySelectorAll('code')),
          // Por classe ou id comuns
          document.querySelector('.pix-code'),
          document.querySelector('#pixCode'),
          // Por conteúdo
          ...Array.from(document.querySelectorAll('div')).filter(div => 
            div.textContent && div.textContent.includes('00020101')
          )
        ].filter(el => el); // Remover nulos
        
        // Verificar cada elemento para encontrar o código PIX
        for (const el of possibleElements) {
          const text = el.textContent.trim();
          // Verificar se parece um código PIX (começa com os números característicos e tem pelo menos 50 caracteres)
          if ((text.startsWith('00020101') || text.startsWith('00020126')) && text.length > 50) {
            return {
              found: true,
              code: text,
              isJson: text.includes('{') && text.includes('}') && text.includes('code')
            };
          }
        }
        
        return { found: false };
      });
      
      if (pixCodeResult.found) {
        console.log('🔍 Código PIX encontrado na página!');
        
        if (pixCodeResult.isJson) {
          console.log('❌ ERRO: O código PIX ainda está em formato JSON:');
          console.log(pixCodeResult.code.substring(0, 50) + '...');
          console.log('\n⚠️ A CORREÇÃO NÃO ESTÁ FUNCIONANDO EM PRODUÇÃO!');
        } else {
          console.log('✅ SUCESSO: O código PIX está em formato texto puro:');
          console.log(pixCodeResult.code.substring(0, 50) + '...');
          console.log('\n🎉 A CORREÇÃO ESTÁ FUNCIONANDO CORRETAMENTE EM PRODUÇÃO!');
        }
      } else {
        console.log('⚠️ Não foi possível encontrar o código PIX na página.');
        console.log('👀 Verifique manualmente o screenshot para confirmar.');
      }
    } else {
      console.log('❌ Não foi encontrado botão para gerar pagamento PIX na página.');
      console.log('ℹ️ Talvez a interface tenha mudado ou a página não carregou completamente.');
    }
    
    // Fechar navegador
    await browser.close();
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
    console.log('\n⚠️ Falha na verificação automatizada. Tente verificar manualmente.');
  }
}

// Verificar se puppeteer está instalado
try {
  require.resolve('puppeteer');
  // Executar verificação
  verifyProductionFix();
} catch (e) {
  console.log('❌ O pacote puppeteer não está instalado!');
  console.log('📦 Instale com: npm install puppeteer');
  console.log('🔄 Em seguida execute este script novamente.');
}
