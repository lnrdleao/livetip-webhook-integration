// Correção PIX seguindo exatamente o padrão Bitcoin que funciona
// Este arquivo corrige o endpoint /generate-qr na API

const https = require('https');

// Configuração PIX (igual ao Bitcoin que funciona)
const PIX_CONFIG = {
    key: 'pagamentos@livetip.gg',
    receiverName: 'LIVETIP PAGAMENTOS',
    city: 'SAO PAULO'
};

// Gerar código PIX (função simplificada que funciona)
function generateSimplePixCode(amount, description, txId) {
    const pixKey = PIX_CONFIG.key;
    const merchantName = PIX_CONFIG.receiverName;
    const city = PIX_CONFIG.city;
    
    let pix = '00020126';
    const merchant = '0014BR.GOV.BCB.PIX01' + String(pixKey.length).padStart(2, '0') + pixKey;
    pix += '58' + String(merchant.length).padStart(2, '0') + merchant;
    pix += '52040000';
    pix += '5303986';
    pix += '54' + String(parseFloat(amount).toFixed(2).length).padStart(2, '0') + parseFloat(amount).toFixed(2);
    pix += '5802BR';
    pix += '59' + String(merchantName.length).padStart(2, '0') + merchantName;
    pix += '60' + String(city.length).padStart(2, '0') + city;
    
    const additionalData = '05' + String(txId.substring(0, 25).length).padStart(2, '0') + txId.substring(0, 25);
    pix += '62' + String(additionalData.length).padStart(2, '0') + additionalData;
    pix += '6304';
    
    // CRC16 calculation
    let crc = 0xFFFF;
    for (let i = 0; i < pix.length; i++) {
        crc ^= (pix.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
        }
    }
    
    return pix + crc.toString(16).toUpperCase().padStart(4, '0');
}

// Generate UUID (igual ao Bitcoin)
function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// NOVA FUNÇÃO: Chamada API LiveTip SIMPLIFICADA (igual ao Bitcoin)
function callLiveTipAPISimple(paymentMethod, userName, amount, externalId) {
    return new Promise((resolve, reject) => {
        let payload;
        
        if (paymentMethod === 'pix') {
            payload = {
                sender: userName || "usuario_webhook",
                content: `Pagamento PIX - R$ ${parseFloat(amount).toFixed(2)}`,
                currency: "BRL",
                amount: parseFloat(amount).toFixed(2)
            };
        } else {
            payload = {
                sender: userName,
                content: `Payment - ${amount} sats`,
                currency: 'BTC',
                amount: amount.toString()
            };
        }
        
        const postData = JSON.stringify(payload);
        console.log(`🚀 API LiveTip v10 SIMPLIFICADA (${paymentMethod}):`, payload);
        
        const options = {
            hostname: 'api.livetip.gg',
            port: 443,
            path: '/api/v1/message/10',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000 // Timeout reduzido
        };
        
        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                console.log(`📥 Resposta API (${response.statusCode}):`, data.substring(0, 100));
                
                if (response.statusCode !== 200 && response.statusCode !== 201) {
                    reject(new Error(`HTTP ${response.statusCode}`));
                    return;
                }
                
                // Detectar HTML (erro)
                if (data.trim().startsWith('<')) {
                    reject(new Error('API returned HTML error'));
                    return;
                }
                
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.code && parsed.code.length > 20) {
                        resolve({ 
                            code: parsed.code, 
                            id: parsed.id || externalId,
                            source: 'livetip_v10_simple'
                        });
                    } else {
                        reject(new Error('Invalid response format'));
                    }
                } catch (jsonError) {
                    // Fallback: texto direto
                    const cleanData = data.trim();
                    if (cleanData.length > 20) {
                        resolve({ 
                            code: cleanData, 
                            id: externalId,
                            source: 'livetip_v10_text'
                        });
                    } else {
                        reject(new Error('Invalid response'));
                    }
                }
            });
        });
        
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
        
        request.on('error', (error) => {
            reject(error);
        });
        
        request.write(postData);
        request.end();
    });
}

module.exports = {
    generateSimplePixCode,
    generateUuid,
    callLiveTipAPISimple
};
