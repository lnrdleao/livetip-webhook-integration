let currentPaymentId = null;
let currentUniqueId = null;

// Configurações Bitcoin - Apenas Satoshis
const BITCOIN_CONFIG = {
    MIN_SATOSHIS: 100,
    PREDEFINED_VALUES: [1000, 2100, 5000, 10000] // Valores em satoshis
};

// Elementos do DOM
const paymentForm = document.getElementById('payment-form');
const qrCodeSection = document.getElementById('qrCodeSection');
const paymentFormCard = document.getElementById('paymentForm');
const loading = document.getElementById('loading');

// Gerar identificador único
function generateUniqueId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `BTC_${timestamp}_${random}`.toUpperCase();
}

// Atualizar interface baseada no método de pagamento
function updatePaymentInterface(paymentMethod) {
    const amountLabel = document.getElementById('amountLabel');
    const amountInput = document.getElementById('amount');
    const satoshiValues = document.getElementById('satoshiValues');
    const uniqueIdGroup = document.getElementById('uniqueIdGroup');
    const uniqueIdInput = document.getElementById('uniqueId');
    
    if (paymentMethod === 'bitcoin') {
        // Mostrar campo de identificador único
        uniqueIdGroup.style.display = 'block';
        currentUniqueId = generateUniqueId();
        uniqueIdInput.value = currentUniqueId;
        
        // Alterar label para satoshis
        amountLabel.textContent = '⚡ Valor (Satoshis):';
        amountInput.min = BITCOIN_CONFIG.MIN_SATOSHIS;
        amountInput.step = '1';
        amountInput.placeholder = '1000';
        
        // Mostrar botões de valores pré-definidos
        satoshiValues.style.display = 'block';
    } else {
        // Esconder campo de identificador único
        uniqueIdGroup.style.display = 'none';
        currentUniqueId = null;
        
        // Voltar para BRL
        amountLabel.textContent = '💵 Valor (R$):';
        amountInput.min = '0.01';
        amountInput.step = '0.01';
        amountInput.placeholder = '10.00';
        
        // Esconder botões de satoshis
        satoshiValues.style.display = 'none';
    }
}

// Submissão do formulário
paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(paymentForm);
    const paymentMethod = formData.get('paymentMethod');
    const amount = parseFloat(formData.get('amount'));
    
    const data = {
        userName: formData.get('userName'),
        amount: amount,
        paymentMethod: paymentMethod,
        uniqueId: paymentMethod === 'bitcoin' ? currentUniqueId : null
    };
    
    // Validar valor mínimo para Bitcoin (em satoshis)
    if (paymentMethod === 'bitcoin' && amount < BITCOIN_CONFIG.MIN_SATOSHIS) {
        alert(`⚠️ Para pagamentos Bitcoin, o mínimo é ${BITCOIN_CONFIG.MIN_SATOSHIS} satoshis`);
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch('/generate-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentPaymentId = result.data.paymentId;
            displayPaymentResult(result.data);
            
            // Salvar no histórico local se for Bitcoin
            if (paymentMethod === 'bitcoin') {
                saveToLocalHistory({
                    id: currentPaymentId,
                    uniqueId: currentUniqueId,
                    userName: data.userName,
                    amount: amount,
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                    method: 'bitcoin'
                });
            }
        } else {
            alert('Erro ao gerar QR Code: ' + result.error);
        }
    } catch (error) {
        alert('Erro na requisição: ' + error.message);
    } finally {
        showLoading(false);
    }
});

// Salvar no histórico local
function saveToLocalHistory(payment) {
    let history = JSON.parse(localStorage.getItem('bitcoinPayments') || '[]');
    
    // Verificar se já existe
    const existingIndex = history.findIndex(p => p.id === payment.id);
    if (existingIndex >= 0) {
        history[existingIndex] = payment;
    } else {
        history.push(payment);
    }
    
    // Manter apenas os últimos 100 pagamentos
    if (history.length > 100) {
        history = history.slice(-100);
    }
    
    localStorage.setItem('bitcoinPayments', JSON.stringify(history));
}

// Carregar histórico de pagamentos
function loadPaymentHistory() {
    const history = JSON.parse(localStorage.getItem('bitcoinPayments') || '[]');
    const historyList = document.getElementById('historyList');
    const paymentStats = document.getElementById('paymentStats');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #666;">Nenhum pagamento Bitcoin registrado ainda.</p>';
        paymentStats.innerHTML = '';
        return;
    }
    
    // Estatísticas
    const totalPayments = history.length;
    const totalSatoshis = history.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = history.filter(p => p.status === 'pending').length;
    const confirmedPayments = history.filter(p => p.status === 'confirmed').length;
    
    paymentStats.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${totalPayments}</div>
                <div class="stat-label">Total de Pagamentos</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalSatoshis.toLocaleString()}</div>
                <div class="stat-label">Total em Satoshis</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${confirmedPayments}</div>
                <div class="stat-label">Confirmados</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${pendingPayments}</div>
                <div class="stat-label">Pendentes</div>
            </div>
        </div>
    `;
    
    // Lista de pagamentos
    const sortedHistory = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    historyList.innerHTML = `
        <table class="payment-table">
            <thead>
                <tr>
                    <th>Data/Hora</th>
                    <th>Nome</th>
                    <th>ID Único</th>
                    <th>Satoshis</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${sortedHistory.map(payment => `
                    <tr class="payment-row ${payment.status}">
                        <td>${new Date(payment.timestamp).toLocaleString('pt-BR')}</td>
                        <td>${payment.userName}</td>
                        <td class="unique-id">${payment.uniqueId}</td>
                        <td class="amount">${payment.amount.toLocaleString()} sats</td>
                        <td class="status ${payment.status}">
                            ${payment.status === 'confirmed' ? '✅ Confirmado' : 
                              payment.status === 'pending' ? '⏳ Pendente' : '❌ Falhou'}
                        </td>
                        <td>
                            <button onclick="checkPaymentStatus('${payment.id}')" class="btn-small">
                                🔄 Verificar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Verificar status de pagamento específico
async function checkPaymentStatus(paymentId) {
    try {
        const response = await fetch(`/payment-status/${paymentId}`);
        const result = await response.json();
        
        if (result.success) {
            // Atualizar status no histórico local
            let history = JSON.parse(localStorage.getItem('bitcoinPayments') || '[]');
            const paymentIndex = history.findIndex(p => p.id === paymentId);
            
            if (paymentIndex >= 0) {
                history[paymentIndex].status = result.status;
                localStorage.setItem('bitcoinPayments', JSON.stringify(history));
                loadPaymentHistory(); // Recarregar a lista
            }
            
            alert(`Status do pagamento: ${result.status === 'confirmed' ? 'Confirmado ✅' : 'Pendente ⏳'}`);
        } else {
            alert('Erro ao verificar status: ' + result.error);
        }
    } catch (error) {
        alert('Erro na verificação: ' + error.message);
    }
}

// Exportar dados de pagamentos
function exportPayments() {
    const history = JSON.parse(localStorage.getItem('bitcoinPayments') || '[]');
    
    if (history.length === 0) {
        alert('Nenhum pagamento para exportar.');
        return;
    }
    
    const csvContent = [
        'Data/Hora,Nome,ID Único,Satoshis,Status,Payment ID',
        ...history.map(p => 
            `"${new Date(p.timestamp).toLocaleString('pt-BR')}","${p.userName}","${p.uniqueId}",${p.amount},"${p.status}","${p.id}"`
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bitcoin_payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Limpar histórico
function clearHistory() {
    if (confirm('⚠️ Tem certeza que deseja limpar todo o histórico de pagamentos? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('bitcoinPayments');
        loadPaymentHistory();
        alert('✅ Histórico limpo com sucesso!');
    }
}

// Exibir resultado do pagamento
function displayPaymentResult(paymentData) {
    paymentFormCard.style.display = 'none';
    qrCodeSection.style.display = 'block';
    
    const qrCodeDiv = document.getElementById('qrCodeDisplay');
    const detailsDiv = document.getElementById('paymentDetails');
    
    // Gerar QR Code
    if (window.QRCode) {
        qrCodeDiv.innerHTML = '';
        new QRCode(qrCodeDiv, {
            text: paymentData.qrCodeText || paymentData.lightningInvoice || paymentData.pixCode,
            width: 256,
            height: 256
        });
    }
    
    // Exibir detalhes baseado no método
    if (paymentData.method === 'bitcoin') {
        const isLiveTip = paymentData.source === 'livetip';
        const sourceText = isLiveTip ? 'processado pela LiveTip' : 'geração local (fallback)';
        const codeLabel = isLiveTip ? 'Lightning Invoice' : 'Bitcoin URI';
        const code = paymentData.lightningInvoice || paymentData.bitcoinUri || '';
        
        detailsDiv.innerHTML = `
            <p><strong>₿ Pagamento Bitcoin ${isLiveTip ? 'Lightning via LiveTip' : '(Local)'}</strong></p>
            <p><strong>👤 Nome:</strong> ${paymentData.userName}</p>
            <p><strong>🔑 ID Único:</strong> <code>${paymentData.uniqueId}</code></p>
            <p><strong>⚡ Valor:</strong> ${paymentData.amount.toLocaleString()} satoshis</p>
            ${paymentData.bitcoinAddress ? `<p><strong>📍 Endereço:</strong> ${paymentData.bitcoinAddress}</p>` : ''}
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 5px 0;">
                <p><strong>⚡ ${codeLabel}:</strong></p>
                <textarea readonly style="width: 100%; height: 80px; font-family: monospace; font-size: 0.8rem; resize: vertical;" 
                    onclick="this.select()">${code}</textarea>
                <button onclick="copyToClipboard('${code}', '${codeLabel} copiado!')" 
                    style="margin-top: 5px; padding: 5px 10px; background: #f7931a; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    📋 Copiar ${codeLabel}
                </button>
            </div>
            <p style="font-size: 0.9rem; color: #666;">
                <strong>💡 Como pagar:</strong><br>
                1. Abra sua carteira Bitcoin${isLiveTip ? ' Lightning' : ''}<br>
                2. Escaneie o QR Code ou copie o ${codeLabel.toLowerCase()}<br>
                3. Confirme o pagamento${isLiveTip ? ' instantâneo' : ''}<br>
                4. O pagamento será confirmado via webhook<br>
                <em>Pagamento ${sourceText}</em>
            </p>
        `;
    } else {
        // PIX (mantém lógica original)
        const isLiveTip = paymentData.source === 'livetip';
        const sourceText = isLiveTip ? 'processada via LiveTip/EFI Bank' : 'geração local (fallback)';
        
        detailsDiv.innerHTML = `
            <p><strong>🏦 PIX ${isLiveTip ? 'via LiveTip/EFI Bank' : '(Local)'}</strong></p>
            <p><strong>Valor:</strong> R$ ${paymentData.amount}</p>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 5px 0;">
                <p><strong>Código PIX:</strong></p>
                <textarea readonly style="width: 100%; height: 60px; font-family: monospace; font-size: 0.8rem;" 
                    onclick="this.select()">${paymentData.pixCode}</textarea>
                <button onclick="copyToClipboard('${paymentData.pixCode}', 'Código PIX copiado!')" 
                    style="margin-top: 5px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    📋 Copiar Código PIX
                </button>
            </div>
            <p style="font-size: 0.9rem; color: #666;">
                <strong>💡 Como pagar:</strong><br>
                1. Abra seu app bancário<br>
                2. Escaneie o QR Code ou copie o código PIX<br>
                3. Confirme o pagamento<br>
                <em>Pagamento ${sourceText}</em>
            </p>
        `;
    }
    
    // Iniciar verificação automática de status para Bitcoin
    if (paymentData.method === 'bitcoin') {
        startStatusPolling();
    }
}

// Verificação automática de status
function startStatusPolling() {
    if (!currentPaymentId) return;
    
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/payment-status/${currentPaymentId}`);
            const result = await response.json();
            
            if (result.success && result.status === 'confirmed') {
                clearInterval(pollInterval);
                
                // Atualizar status no histórico local
                let history = JSON.parse(localStorage.getItem('bitcoinPayments') || '[]');
                const paymentIndex = history.findIndex(p => p.id === currentPaymentId);
                
                if (paymentIndex >= 0) {
                    history[paymentIndex].status = 'confirmed';
                    localStorage.setItem('bitcoinPayments', JSON.stringify(history));
                }
                
                // Notificar usuário
                showPaymentConfirmation();
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }, 5000); // Verificar a cada 5 segundos
    
    // Parar após 10 minutos
    setTimeout(() => clearInterval(pollInterval), 600000);
}

// Mostrar confirmação de pagamento
function showPaymentConfirmation() {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'payment-confirmation';
    confirmationDiv.innerHTML = `
        <div class="confirmation-content">
            <h3>🎉 Pagamento Confirmado!</h3>
            <p>Seu pagamento Bitcoin foi confirmado com sucesso.</p>
            <button onclick="this.closest('.payment-confirmation').remove()">Fechar</button>
        </div>
    `;
    document.body.appendChild(confirmationDiv);
    
    // Remover após 10 segundos
    setTimeout(() => {
        if (confirmationDiv.parentNode) {
            confirmationDiv.remove();
        }
    }, 10000);
}

// Utilitários
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        alert(successMessage);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar. Tente selecionar e copiar manualmente.');
    });
}

function newPayment() {
    qrCodeSection.style.display = 'none';
    paymentFormCard.style.display = 'block';
    paymentForm.reset();
    currentPaymentId = null;
    currentUniqueId = null;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const paymentMethodInputs = document.querySelectorAll('input[name="paymentMethod"]');
    
    paymentMethodInputs.forEach(input => {
        input.addEventListener('change', function() {
            updatePaymentInterface(this.value);
        });
    });
    
    // Event listeners para botões de satoshis
    const satoshiButtons = document.querySelectorAll('.satoshi-btn');
    satoshiButtons.forEach(button => {
        button.addEventListener('click', function() {
            const satoshis = parseInt(this.dataset.sats);
            const amountInput = document.getElementById('amount');
            
            // Definir valor em satoshis
            amountInput.value = satoshis;
            
            // Atualizar visual dos botões
            satoshiButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            
            // Feedback visual
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Carregar histórico automaticamente
    loadPaymentHistory();
});
