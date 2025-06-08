// Teste simples para verificar se o dotenv está funcionando
require('dotenv').config();

console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE ===');
console.log('PIX_KEY:', process.env.PIX_KEY);
console.log('PIX_RECEIVER_NAME:', process.env.PIX_RECEIVER_NAME);
console.log('PIX_CITY:', process.env.PIX_CITY);
console.log('WEBHOOK_SECRET:', process.env.WEBHOOK_SECRET);

// Carregar config depois para ver os valores
const config = require('./config');
console.log('\n=== CONFIGURAÇÃO FINAL ===');
console.log('config.pix.key:', config.pix.key);
console.log('config.pix.receiverName:', config.pix.receiverName);
console.log('config.pix.city:', config.pix.city);
