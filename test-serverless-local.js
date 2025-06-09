// Teste local da função serverless
const handler = require('./api/index.js');

// Simular request e response
const mockReq = {
    method: 'GET',
    url: '/health',
    headers: {
        'host': 'localhost:3000'
    }
};

const mockRes = {
    statusCode: 200,
    headers: {},
    body: '',
    
    setHeader(name, value) {
        this.headers[name] = value;
    },
    
    status(code) {
        this.statusCode = code;
        return this;
    },
    
    json(data) {
        this.body = JSON.stringify(data, null, 2);
        this.setHeader('Content-Type', 'application/json');
        console.log(`Status: ${this.statusCode}`);
        console.log(`Headers:`, this.headers);
        console.log(`Body:`, this.body);
        return this;
    },
    
    send(data) {
        this.body = data;
        console.log(`Status: ${this.statusCode}`);
        console.log(`Body Length: ${data.length} chars`);
        return this;
    },
    
    end() {
        console.log('Response ended');
        return this;
    }
};

console.log('🧪 Testando função serverless localmente...');
console.log('='.repeat(50));

// Testar diferentes endpoints
const tests = [
    { method: 'GET', url: '/health' },
    { method: 'GET', url: '/' },
    { method: 'GET', url: '/webhook' },
    { method: 'GET', url: '/api/test' }
];

async function runTests() {
    for (const test of tests) {
        console.log(`\n🔍 Testando: ${test.method} ${test.url}`);
        console.log('-'.repeat(30));
        
        const req = { ...mockReq, method: test.method, url: test.url };
        const res = { ...mockRes };
        
        try {
            await handler(req, res);
            console.log('✅ Teste passou!');
        } catch (error) {
            console.log('❌ Erro:', error.message);
        }
    }
    
    console.log('\n🎉 Testes concluídos!');
}

runTests();
