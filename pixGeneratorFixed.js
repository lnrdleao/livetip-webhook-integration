// Gerador PIX melhorado com códigos válidos garantidos
const crypto = require('crypto');

class PixGeneratorFixed {
    constructor(config = {}) {
        this.receiverName = config.receiverName || 'LIVETIP PAGAMENTOS';
        this.city = config.city || 'SAO PAULO';
        this.pixKey = config.key || 'pagamentos@livetip.gg';
    }

    generatePixCode(amount, description = '', transactionId = '') {
        // Validar valor
        const allowedAmounts = [1, 2, 3, 4];
        if (!allowedAmounts.includes(Number(amount))) {
            throw new Error('Valor PIX deve ser R$ 1, 2, 3 ou 4');
        }

        try {
            // Construir payload PIX EMV válido
            let payload = '';
            
            // Payload Format Indicator (obrigatório)
            payload += '000201';
            
            // Point of Initiation Method (12 = QR Code estático reutilizável)
            payload += '010212';
            
            // Merchant Account Information (Tag 26)
            const merchantAccount = this.buildMerchantAccount();
            payload += `26${merchantAccount.length.toString().padStart(2, '0')}${merchantAccount}`;
            
            // Merchant Category Code (0000 = não especificado)
            payload += '52040000';
            
            // Transaction Currency (986 = Real brasileiro)
            payload += '5303986';
            
            // Transaction Amount
            const amountStr = Number(amount).toFixed(2);
            payload += `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
            
            // Country Code
            payload += '5802BR';
            
            // Merchant Name
            const name = this.receiverName.toUpperCase().substring(0, 25);
            payload += `59${name.length.toString().padStart(2, '0')}${name}`;
            
            // Merchant City
            const city = this.city.toUpperCase().substring(0, 15);
            payload += `60${city.length.toString().padStart(2, '0')}${city}`;
            
            // Additional Data Field (se houver descrição)
            if (description || transactionId) {
                const additionalData = this.buildAdditionalData(description, transactionId);
                if (additionalData) {
                    payload += `62${additionalData.length.toString().padStart(2, '0')}${additionalData}`;
                }
            }
            
            // CRC16 placeholder
            payload += '6304';
            
            // Calcular e adicionar CRC16
            const crc = this.calculateCRC16(payload);
            payload = payload.substring(0, payload.length - 4) + crc;
            
            return payload;
            
        } catch (error) {
            console.error('Erro ao gerar PIX:', error);
            throw new Error(`Falha na geração PIX: ${error.message}`);
        }
    }

    buildMerchantAccount() {
        // GUI (Globally Unique Identifier) para PIX
        let account = '0014BR.GOV.BCB.PIX';
        
        // Chave PIX
        account += `01${this.pixKey.length.toString().padStart(2, '0')}${this.pixKey}`;
        
        return account;
    }

    buildAdditionalData(description, transactionId) {
        let data = '';
        
        // Transaction ID (máximo 25 caracteres)
        if (transactionId) {
            const txId = String(transactionId).substring(0, 25);
            data += `05${txId.length.toString().padStart(2, '0')}${txId}`;
        }
        
        // Description (máximo 72 caracteres)
        if (description) {
            const desc = String(description).substring(0, 72);
            data += `02${desc.length.toString().padStart(2, '0')}${desc}`;
        }
        
        return data;
    }

    calculateCRC16(payload) {
        const poly = 0x1021;
        let crc = 0xFFFF;
        
        for (let i = 0; i < payload.length; i++) {
            crc ^= (payload.charCodeAt(i) << 8);
            
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ poly;
                } else {
                    crc <<= 1;
                }
                crc &= 0xFFFF;
            }
        }
        
        return crc.toString(16).toUpperCase().padStart(4, '0');
    }

    // Validar se o código PIX gerado está correto
    validateGeneratedPix(pixCode) {
        const checks = {
            minLength: pixCode.length >= 50,
            startsCorrect: pixCode.startsWith('000201'),
            containsPix: pixCode.includes('BR.GOV.BCB.PIX'),
            hasAmount: pixCode.includes('54'),
            hasMerchant: pixCode.includes('59'),
            hasCountry: pixCode.includes('5802BR'),
            hasCRC: /[0-9A-F]{4}$/.test(pixCode)
        };
        
        return Object.values(checks).every(check => check);
    }
}

module.exports = PixGeneratorFixed;
