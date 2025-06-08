// Utilitários para geração de códigos PIX
const crypto = require('crypto');

class PixGenerator {
    constructor(config) {
        this.receiverName = config.receiverName || 'LIVETIP PAGAMENTOS';
        this.city = config.city || 'SAO PAULO';
        this.pixKey = config.key;
    }

    // Gerar código PIX EMV
    generatePixCode(amount, description, transactionId) {
        const payload = this.buildPayload(amount, description, transactionId);
        const crc = this.calculateCRC16(payload);
        return payload + crc;
    }

    buildPayload(amount, description, transactionId) {
        // Payload Indicator
        let payload = '000201';
        
        // Point of Initiation Method (12 = static, 11 = dynamic)
        payload += '010212';
        
        // Merchant Account Information
        const merchantInfo = this.buildMerchantAccountInfo();
        payload += `26${merchantInfo.length.toString().padStart(2, '0')}${merchantInfo}`;
        
        // Merchant Category Code
        payload += '52040000';
        
        // Transaction Currency (986 = BRL)
        payload += '5303986';
        
        // Transaction Amount
        if (amount) {
            const amountStr = amount.toFixed(2);
            payload += `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
        }
        
        // Country Code
        payload += '5802BR';
        
        // Merchant Name
        const merchantName = this.receiverName.substring(0, 25);
        payload += `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`;
        
        // Merchant City
        const merchantCity = this.city.substring(0, 15);
        payload += `60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`;
        
        // Additional Data Field Template
        if (description || transactionId) {
            const additionalData = this.buildAdditionalData(description, transactionId);
            payload += `62${additionalData.length.toString().padStart(2, '0')}${additionalData}`;
        }
        
        // CRC16 placeholder
        payload += '6304';
        
        return payload;
    }

    buildMerchantAccountInfo() {
        // GUI (Globally Unique Identifier)
        let merchantInfo = '0014BR.GOV.BCB.PIX';
        
        // PIX Key
        merchantInfo += `01${this.pixKey.length.toString().padStart(2, '0')}${this.pixKey}`;
        
        return merchantInfo;
    }

    buildAdditionalData(description, transactionId) {
        let additionalData = '';
        
        // Transaction ID
        if (transactionId) {
            const txId = transactionId.substring(0, 25);
            additionalData += `05${txId.length.toString().padStart(2, '0')}${txId}`;
        }
        
        // Description
        if (description) {
            const desc = description.substring(0, 72);
            additionalData += `02${desc.length.toString().padStart(2, '0')}${desc}`;
        }
        
        return additionalData;
    }

    calculateCRC16(payload) {
        const polynomial = 0x1021;
        let crc = 0xFFFF;
        
        for (let i = 0; i < payload.length; i++) {
            crc ^= (payload.charCodeAt(i) << 8);
            
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ polynomial;
                } else {
                    crc <<= 1;
                }
                crc &= 0xFFFF;
            }
        }
        
        return crc.toString(16).toUpperCase().padStart(4, '0');
    }
}

module.exports = PixGenerator;
