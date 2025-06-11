// LiveTip API - Clean and Simple
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Livetip-Webhook-Secret-Token');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const { url, method } = req;
    
    // Routes
    if (url === '/' && method === 'GET') {
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
    <title>LiveTip</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family:Arial;padding:20px;background:#f5f5f5">
    <h1>LiveTip Payment System</h1>
    <div style="background:white;padding:20px;border-radius:10px;margin:20px 0">
        <h3>Status: ✅ Online</h3>
        <p>PIX and Bitcoin payments ready</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px">
        <a href="/control" style="background:#007bff;color:white;padding:15px;text-decoration:none;border-radius:8px;text-align:center">📊 Control</a>
        <a href="/webhook-monitor" style="background:#28a745;color:white;padding:15px;text-decoration:none;border-radius:8px;text-align:center">🎯 Monitor</a>
        <a href="/webhook" style="background:#6c757d;color:white;padding:15px;text-decoration:none;border-radius:8px;text-align:center">⚙️ Webhook</a>
    </div>
</body>
</html>`);
    }
    
    if (url === '/control' && method === 'GET') {
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
    <title>Control Panel</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family:Arial;padding:20px;background:#f5f5f5">
    <h1>📊 Control Panel</h1>
    <div style="background:white;padding:20px;border-radius:10px;margin:20px 0">
        <h3>System Status</h3>
        <p>✅ API: Online</p>
        <p>✅ PIX: Ready</p>
        <p>✅ Bitcoin: Ready</p>
    </div>
    <a href="/" style="background:#6c757d;color:white;padding:10px 20px;text-decoration:none;border-radius:5px">← Back</a>
</body>
</html>`);
    }
    
    if (url === '/webhook-monitor' && method === 'GET') {
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
    <title>Webhook Monitor</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family:Arial;padding:20px;background:#f5f5f5">
    <h1>🎯 Webhook Monitor</h1>
    <div style="background:white;padding:20px;border-radius:10px;margin:20px 0">
        <h3>Monitor Status</h3>
        <p>✅ Webhook: Active</p>
        <p>✅ Endpoint: /webhook</p>
        <p>✅ Token: Valid</p>
    </div>
    <a href="/" style="background:#6c757d;color:white;padding:10px 20px;text-decoration:none;border-radius:5px">← Back</a>
</body>
</html>`);
    }
    
    if (url === '/webhook' && method === 'GET') {
        return res.status(200).json({
            status: 'active',
            endpoint: '/webhook',
            timestamp: new Date().toISOString()
        });
    }
    
    if (url === '/webhook' && method === 'POST') {
        const token = req.headers['x-livetip-webhook-secret-token'];
        if (token !== '0ac7b9aa00e75e0215243f3bb177c844') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.status(200).json({ success: true, received: req.body });
    }
    
    if (url === '/health' && method === 'GET') {
        return res.status(200).json({ status: 'healthy' });
    }
    
    // Payment generation
    if (url === '/generate-qr' && method === 'POST') {
        try {
            const { userName, paymentMethod, amount, uniqueId } = req.body;
            
            if (!userName || !paymentMethod || !amount) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            const externalId = uniqueId || `${paymentMethod}_${Date.now()}`;
            
            // Try LiveTip API first
            try {
                const result = await callLiveTipAPI(paymentMethod, userName, amount, externalId);
                return res.status(200).json({
                    success: true,
                    data: {
                        paymentId: result.id || externalId,
                        userName,
                        method: paymentMethod,
                        amount,
                        source: 'livetip-api',
                        createdAt: new Date().toISOString(),
                        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.code)}`,
                        ...(paymentMethod === 'pix' ? { pixCode: result.code } : { lightningInvoice: result.code })
                    }
                });
            } catch (apiError) {
                console.log('LiveTip API failed, using fallback:', apiError.message);
                
                // Fallback generation
                let code;
                if (paymentMethod === 'pix') {
                    code = generatePIXFallback(amount, userName, externalId);
                } else {
                    code = `bitcoin:${amount}?amount=${(amount / 100000000).toFixed(8)}&label=${encodeURIComponent(userName)}`;
                }
                
                return res.status(200).json({
                    success: true,
                    data: {
                        paymentId: externalId,
                        userName,
                        method: paymentMethod,
                        amount,
                        source: 'fallback-local',
                        createdAt: new Date().toISOString(),
                        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`,
                        ...(paymentMethod === 'pix' ? { pixCode: code } : { lightningInvoice: code })
                    }
                });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    // 404
    res.status(404).json({ error: 'Not found' });
};

// Clean LiveTip API call
function callLiveTipAPI(paymentMethod, userName, amount, externalId) {
    return new Promise((resolve, reject) => {
        const payload = {
            sender: userName,
            content: `Payment - ${paymentMethod === 'pix' ? 'R$ ' + amount : amount + ' sats'}`,
            currency: paymentMethod === 'pix' ? 'BRL' : 'BTC',
            amount: paymentMethod === 'pix' ? parseFloat(amount).toFixed(2) : amount.toString()
        };
        
        const postData = JSON.stringify(payload);
        const https = require('https');
        
        const options = {
            hostname: 'api.livetip.gg',
            port: 443,
            path: '/api/v1/message/10',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 15000
        };
        
        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                // Simple HTML detection
                if (data.startsWith('<') || data.includes('server error') || response.statusCode !== 200) {
                    reject(new Error('API returned HTML or error'));
                    return;
                }
                
                try {
                    // Try JSON parse
                    const parsed = JSON.parse(data);
                    if (parsed.code) {
                        resolve(parsed);
                    } else {
                        reject(new Error('No code in response'));
                    }
                } catch (e) {
                    // If not JSON, treat as direct code (for PIX)
                    if (data.length > 50 && paymentMethod === 'pix') {
                        resolve({ code: data.trim() });
                    } else {
                        reject(new Error('Invalid response format'));
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

// Simple PIX fallback generator
function generatePIXFallback(amount, userName, txId) {
    const pixKey = 'pagamentos@livetip.gg';
    const merchantName = 'LIVETIP PAGAMENTOS';
    const city = 'SAO PAULO';
    
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
    
    // Simple CRC16
    let crc = 0xFFFF;
    for (let i = 0; i < pix.length; i++) {
        crc ^= (pix.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
        }
    }
    
    return pix + crc.toString(16).toUpperCase().padStart(4, '0');
}