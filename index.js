// Minimal serverless function for Vercel
module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        message: 'LiveTip Webhook System - FUNCIONANDO!',
        status: 'OK',
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        version: '3.0-hotfix'
    });
};
