// Serviço para integração com a API da LiveTip
const fetch = require('node-fetch');
const config = require('./config');

class LiveTipService {
    constructor() {
        // Nota: Não estamos mais usando o baseUrl dinamicamente.
        // Em vez disso, estamos usando diretamente os endpoints corretos (hardcoded)
        // para cada método específico (PIX, Bitcoin, auth, etc)
        
        // Mantemos o baseUrl apenas para compatibilidade com código legado e logs
        this.baseUrl = config.payment.apiUrl;
        this.apiToken = config.payment.apiToken;
        this.username = process.env.LIVETIP_USERNAME;
        this.password = process.env.LIVETIP_PASSWORD;
        
        // Log das configurações (sem mostrar senha)
        console.log('🔧 LiveTip Service inicializado:');
        console.log(`   Base URL (info): ${this.baseUrl}`);
        console.log(`   ↳ Endpoint real: https://api.livetip.gg/api/v1/message/10`);
        console.log(`   Username: ${this.username ? '✅ Configurado' : '❌ Não configurado'}`);
        console.log(`   Password: ${this.password ? '✅ Configurado' : '❌ Não configurado'}`);
        console.log(`   API Token: ${this.apiToken ? '✅ Configurado' : '❌ Não configurado'}`);
    }

    // Fazer login na API se necessário
    async authenticate() {
        if (this.apiToken) {
            console.log('🔑 Usando token API existente');
            return this.apiToken;
        }

        if (!this.username || !this.password) {
            throw new Error('Credenciais não configuradas. Execute setup-api-credentials.ps1');
        }        try {
            console.log('🔐 Fazendo login na API LiveTip...');
            const response = await fetch(`https://api.livetip.gg/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(`Erro no login: ${response.status} - ${JSON.stringify(result)}`);
            }

            this.apiToken = result.token || result.access_token || result.authToken;
            console.log('✅ Login realizado com sucesso');
            
            return this.apiToken;

        } catch (error) {
            console.error('❌ Erro no login da API LiveTip:', error);
            throw error;
        }    }    // Criar pagamento PIX via LiveTip usando endpoint correto
    async createPixPayment(paymentData) {
        try {
            console.log('🏦 Criando pagamento PIX diretamente na LiveTip (sem autenticação)...');

            // Baseado na API documentation do LiveTip
            const payload = {
                sender: paymentData.userName || "usuario_webhook",
                content: `Pagamento LiveTip - R$ ${paymentData.amount.toFixed(2)}`,
                currency: "BRL",
                amount: paymentData.amount.toFixed(2) // Formato decimal com 2 casas
            };            console.log('🏦 Enviando para API LiveTip (endpoint /message/10):', JSON.stringify(payload, null, 2));
            
            // Usando o endpoint correto da API do LiveTip (/message/10) - SEM AUTENTICAÇÃO
            const response = await fetch(`https://api.livetip.gg/api/v1/message/10`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
              if (!response.ok) {
                throw new Error(`Erro na API LiveTip: ${response.status} - ${response.statusText}`);
            }

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
            
            if (!pixCodeFromApi || pixCodeFromApi.length < 50) {
                throw new Error('Código PIX inválido recebido da API');
            }
            // Importar QR Code Generator de forma mais robusta
            const qrCodeGenerator = require('./qrCodeGenerator');
            
            try {
                // Gerar QR code do PIX diretamente usando a instância ou método exportado
                const qrCodeDataUrl = await qrCodeGenerator.generateWithLogo(pixCodeFromApi, 'pix');
                
                // Retornar dados do pagamento com o código PIX e QR code da API LiveTip
                return {
                    success: true,
                    paymentId: paymentData.externalId || `livetip_${Date.now()}`,
                    pixCode: pixCodeFromApi,
                    qrCodeImage: qrCodeDataUrl, // QR code já gerado
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
                    liveTipData: { pixCode: pixCodeFromApi },
                    source: 'livetip_api'
                };
            } catch (qrError) {
                console.error('⚠️ Erro ao gerar QR code no LiveTipService:', qrError);
                // Mesmo com erro no QR, retornamos o código PIX
                return {
                    success: true,
                    paymentId: paymentData.externalId || `livetip_${Date.now()}`,
                    pixCode: pixCodeFromApi,
                    qrCodeImage: null, // Será gerado pelo QR generator local como fallback
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
                    liveTipData: { pixCode: pixCodeFromApi },
                    source: 'livetip_api'
                };
            }

        } catch (error) {
            console.error('❌ Erro ao criar pagamento PIX:', error);
            throw error;
        }
    }    // Criar pagamento Bitcoin via LiveTip usando endpoint correto
    async createBitcoinPayment(paymentData) {
        try {
            console.log('₿ Criando pagamento Bitcoin diretamente na LiveTip (sem autenticação)...');

            // Valor já está em satoshis, não precisa converter
            console.log(`💰 Valor: ${paymentData.amount} satoshis`);
            console.log(`🔑 ID Único: ${paymentData.uniqueId}`);
            console.log(`👤 Nome: ${paymentData.userName}`);            // Ajustado: Nome vai para "sender" e ID Único vai para "content"
            const payload = {
                sender: paymentData.userName || "usuario_webhook", // Nome no campo correto
                content: paymentData.uniqueId || `BTC_${Date.now()}`, // ID Único como mensagem
                currency: "BTC",
                amount: paymentData.amount.toString() // Valor em satoshis como string
            };

            console.log('₿ Enviando para API LiveTip (endpoint /message/10):', JSON.stringify(payload, null, 2));
            
            // Usando o mesmo endpoint da API do LiveTip (/message/10) - SEM AUTENTICAÇÃO
            const response = await fetch(`https://api.livetip.gg/api/v1/message/10`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro na API LiveTip: ${response.status} - ${errorText}`);
            }

            // A API retorna JSON com o Lightning Invoice (diferente do PIX que é texto)
            const bitcoinResponse = await response.json();
            
            console.log('✅ Resposta Bitcoin recebida da API LiveTip:', bitcoinResponse);

            if (!bitcoinResponse.code || bitcoinResponse.code.length < 50) {
                throw new Error('Lightning Invoice inválido recebido da API');
            }            // Retornar dados do pagamento com o Lightning Invoice da API LiveTip
            return {
                success: true,
                paymentId: bitcoinResponse.id || paymentData.externalId || `livetip_btc_${Date.now()}`,
                lightningInvoice: bitcoinResponse.code,
                satoshis: paymentData.amount,
                qrCodeImage: null, // Será gerado pelo QR generator local
                expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
                liveTipData: { 
                    lightningInvoice: bitcoinResponse.code, 
                    liveTipId: bitcoinResponse.id,
                    satoshis: paymentData.amount
                },
                source: 'livetip_api'
            };

        } catch (error) {
            console.error('❌ Erro ao criar pagamento Bitcoin:', error);
            throw error;
        }
    }    // Verificar status de pagamento
    async getPaymentStatus(paymentId) {
        try {
            const response = await fetch(`https://api.livetip.gg/api/v1/payments/${paymentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'X-API-Key': this.apiToken
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(`Erro ao verificar status: ${response.status} - ${JSON.stringify(result)}`);
            }

            return result;

        } catch (error) {
            console.error('❌ Erro ao verificar status do pagamento:', error);
            throw error;
        }
    }    // Cancelar pagamento
    async cancelPayment(paymentId) {
        try {
            const response = await fetch(`https://api.livetip.gg/api/v1/payments/${paymentId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'X-API-Key': this.apiToken
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(`Erro ao cancelar pagamento: ${response.status} - ${JSON.stringify(result)}`);
            }

            return result;

        } catch (error) {
            console.error('❌ Erro ao cancelar pagamento:', error);
            throw error;
        }
    }
}

module.exports = LiveTipService;
