console.log('🧪 Testing PIX Validation Logic...');

// PIX configuration test
const PIX_CONFIG = {
    key: 'pagamentos@livetip.gg',
    receiverName: 'LIVETIP PAGAMENTOS',
    city: 'SAO PAULO',
    merchantCategoryCode: '0000',
    currency: '986',
    allowedAmounts: [1, 2, 3, 4],
    maxAmount: 4.00,
    minAmount: 1.00
};

// Copy of validation function from API
function validatePixPayment(amount, userName) {
    const errors = [];
    
    // Validar valor
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
        errors.push('Valor deve ser numérico');
    } else {
        // Verificar se o valor está na lista de permitidos (aceita 1, 1.0, 1.00, etc.)
        const allowedAmountsNormalized = PIX_CONFIG.allowedAmounts.map(v => parseFloat(v));
        if (!allowedAmountsNormalized.includes(amountValue)) {
            errors.push(`Valor deve ser um dos permitidos: R$ ${PIX_CONFIG.allowedAmounts.join(', ')}`);
        } else if (amountValue < PIX_CONFIG.minAmount || amountValue > PIX_CONFIG.maxAmount) {
            errors.push(`Valor deve estar entre R$ ${PIX_CONFIG.minAmount} e R$ ${PIX_CONFIG.maxAmount}`);
        }
    }
    
    // Validar nome do usuário
    if (!userName || userName.trim().length < 2) {
        errors.push('Nome do usuário é obrigatório (mínimo 2 caracteres)');
    } else if (userName.length > 50) {
        errors.push('Nome do usuário muito longo (máximo 50 caracteres)');
    }
    
    // Validar caracteres especiais no nome
    if (userName && !/^[a-zA-ZÀ-ÿ\s0-9]+$/.test(userName)) {
        errors.push('Nome deve conter apenas letras, números e espaços');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        sanitizedName: userName ? userName.trim().substring(0, 50) : '',
        validatedAmount: amountValue
    };
}

// Test cases
const testCases = [
    { amount: "2", userName: "Test User Production" },
    { amount: "2.00", userName: "Test User Production" },
    { amount: 2, userName: "Test User Production" },
    { amount: 2.00, userName: "Test User Production" },
    { amount: "1", userName: "Usuario Teste" },
    { amount: "3", userName: "Usuario Teste" },
    { amount: "4", userName: "Usuario Teste" },
    { amount: "5", userName: "Usuario Teste" }, // Invalid
    { amount: "abc", userName: "Usuario Teste" }, // Invalid
];

console.log('\n🔍 Testing PIX Validation Cases:');
testCases.forEach((testCase, index) => {
    console.log(`\nTest ${index + 1}: amount="${testCase.amount}", userName="${testCase.userName}"`);
    const result = validatePixPayment(testCase.amount, testCase.userName);
    console.log(`Valid: ${result.isValid}`);
    if (!result.isValid) {
        console.log(`Errors: ${result.errors.join(', ')}`);
    } else {
        console.log(`Sanitized: amount=${result.validatedAmount}, name="${result.sanitizedName}"`);
    }
});

console.log('\n✅ PIX Validation Test Complete!');
