// Simple server for testing LiveTip MVP
const http = require('http');
const url = require('url');

// Import the MVP handler
const mvpHandler = require('./index.js');

const PORT = process.env.PORT || 3000;

// Add JSON support to standard HTTP response
function addResponseMethods(res) {
    // Add json method
    res.json = function(obj) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
        return this;
    };
    
    // Add status method
    res.status = function(code) {
        this.statusCode = code;
        return this;
    };
    
    // Add send method
    res.send = function(body) {
        res.setHeader('Content-Type', 'text/html');
        res.end(body);
        return this;
    };
    
    return res;
}

const server = http.createServer((req, res) => {
    // Add Express-like methods to response
    res = addResponseMethods(res);
    
    // Parse URL and add to request object
    const parsedUrl = url.parse(req.url, true);
    req.url = parsedUrl.pathname;
    req.query = parsedUrl.query;
    
    // Add basic request logging
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Use the MVP handler
    mvpHandler(req, res);
});

server.listen(PORT, () => {
    console.log(`🚀 LiveTip MVP Server running on http://localhost:${PORT}`);
    console.log(`📍 Open http://localhost:${PORT} to test the interface`);
    console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`\n📝 To run tests: node test-mvp.js`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = server;
