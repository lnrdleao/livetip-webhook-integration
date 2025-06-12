let currentPaymentId = null;
let currentUniqueId = null;
let paymentPollingInterval = null; // Declaração global explícita para corrigir o erro
let currentPaymentStatus = 'pending'; // Status inicial padrão

// Configurações Bitcoin - Apenas Satoshis
const BITCOIN_CONFIG = {
    MIN_SATOSHIS: 100,
    PREDEFINED_VALUES: [100, 200, 300, 400] // Valores em satoshis
};

// Configurações PIX - Valores em Reais
const PIX_CONFIG = {
    MIN_REAIS: 1,
    PREDEFINED_VALUES: [1, 2, 3, 4] // Valores em reais
};

// Elementos do DOM
const paymentForm = document.getElementById('payment-form');
const qrCodeSection = document.getElementById('qrCodeSection');
const paymentFormCard = document.getElementById('paymentForm');
const loading = document.getElementById('loading');

// Gerar identificador único para Bitcoin
function generateUniqueId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `BTC_${timestamp}_${random}`.toUpperCase();
}

// Gerar identificador único para PIX
function generatePixUniqueId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `PIX_${timestamp}_${random}`.toUpperCase();
}

// Atualizar interface baseada no método de pagamento
function updatePaymentInterface(paymentMethod) {
    const amountLabel = document.getElementById('amountLabel');
    const amountInput = document.getElementById('amount');
    const satoshiValues = document.getElementById('satoshiValues');
    const pixValues = document.getElementById('pixValues');
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
        
        // Mostrar botões de valores pré-definidos Bitcoin
        satoshiValues.style.display = 'block';
        // Esconder botões PIX
        if (pixValues) pixValues.style.display = 'none';
    } else if (paymentMethod === 'pix') {
        // Mostrar campo de identificador único para PIX também
        uniqueIdGroup.style.display = 'block';
        currentUniqueId = generatePixUniqueId();
        uniqueIdInput.value = currentUniqueId;
        
        // Alterar label para PIX (mantém em reais)
        amountLabel.textContent = '💵 Valor (R$):';
        amountInput.min = '1';
        amountInput.step = '1';
        amountInput.placeholder = '2';
        
        // Mostrar botões PIX
        if (pixValues) pixValues.style.display = 'block';
        // Esconder botões de satoshis
        satoshiValues.style.display = 'none';
    } else {
        // Caso genérico (não deveria acontecer)
        uniqueIdGroup.style.display = 'none';
        currentUniqueId = null;
        amountLabel.textContent = '💵 Valor (R$):';
        amountInput.min = '0.01';
        amountInput.step = '0.01';
        amountInput.placeholder = '10.00';
        satoshiValues.style.display = 'none';
        if (pixValues) pixValues.style.display = 'none';
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
        uniqueId: currentUniqueId // Agora ambos Bitcoin e PIX têm uniqueId
    };
    
    // Validar valor mínimo para Bitcoin (em satoshis)
    if (paymentMethod === 'bitcoin' && amount < BITCOIN_CONFIG.MIN_SATOSHIS) {
        alert(`⚠️ Para pagamentos Bitcoin, o mínimo é ${BITCOIN_CONFIG.MIN_SATOSHIS} satoshis`);
        return;
    }
    
    // Validar valores PIX (R$ 1, 2, 3, 4)
    if (paymentMethod === 'pix' && !PIX_CONFIG.PREDEFINED_VALUES.includes(amount)) {
        alert(`⚠️ Para pagamentos PIX, selecione um dos valores: R$ ${PIX_CONFIG.PREDEFINED_VALUES.join(', ')}`);
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
        
        if (result.success) {            currentPaymentId = result.data.paymentId;
            displayPaymentResult(result.data);
            
            // Salvar no histórico local para Bitcoin e PIX
            if (paymentMethod === 'bitcoin' || paymentMethod === 'pix') {
                saveToLocalHistory({
                    id: currentPaymentId,
                    uniqueId: currentUniqueId,
                    userName: data.userName,
                    amount: amount,
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                    method: paymentMethod
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

// Salvar no histórico local (Bitcoin e PIX)
function saveToLocalHistory(payment) {
    let history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
    
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
    
    localStorage.setItem('paymentHistory', JSON.stringify(history));
}

// Carregar histórico de pagamentos (Bitcoin e PIX)
function loadPaymentHistory() {
    const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
    const historyList = document.getElementById('historyList');
    const paymentStats = document.getElementById('paymentStats');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #666;">Nenhum pagamento registrado ainda.</p>';
        paymentStats.innerHTML = '';
        return;
    }
    
    // Estatísticas separadas por método
    const bitcoinPayments = history.filter(p => p.method === 'bitcoin');
    const pixPayments = history.filter(p => p.method === 'pix');
    
    const totalPayments = history.length;
    const totalSatoshis = bitcoinPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPix = pixPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = history.filter(p => p.status === 'pending').length;
    const confirmedPayments = history.filter(p => p.status === 'confirmed').length;
      paymentStats.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${totalPayments}</div>
                <div class="stat-label">Total de Pagamentos</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${bitcoinPayments.length}</div>
                <div class="stat-label">Bitcoin (${totalSatoshis.toLocaleString()} sats)</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${pixPayments.length}</div>
                <div class="stat-label">PIX (R$ ${totalPix.toFixed(2)})</div>
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
                    <th>Método</th>
                    <th>Valor</th>
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
                        <td class="method ${payment.method}">
                            ${payment.method === 'bitcoin' ? '₿ Bitcoin' : '🏦 PIX'}
                        </td>
                        <td class="amount">
                            ${payment.method === 'bitcoin' 
                                ? `${payment.amount.toLocaleString()} sats` 
                                : `R$ ${payment.amount.toFixed(2)}`}
                        </td>
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

// Sistema de verificação automática de status de pagamento
function startPaymentStatusPolling(paymentId) {
    console.log('🔄 Iniciando verificação automática de status para:', paymentId);
    
    // Limpar polling anterior se existir
    if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
    }
    
    // Atualizar status inicial
    updatePaymentStatus('pending');
    
    // Verificar status a cada 5 segundos
    paymentPollingInterval = setInterval(async () => {
        try {
            await checkPaymentStatus(paymentId);
        } catch (error) {
            console.error('Erro na verificação de status:', error);
        }
    }, 5000);
    
    // Parar verificação após 30 minutos (timeout)
    setTimeout(() => {
        if (paymentPollingInterval) {
            clearInterval(paymentPollingInterval);
            paymentPollingInterval = null;
            console.log('⏰ Timeout: Verificação de status encerrada');
            
            // Se ainda estiver pendente, marcar como expirado
            if (currentPaymentStatus === 'pending') {
                updatePaymentStatus('expired');
            }
        }
    }, 30 * 60 * 1000); // 30 minutos
}

// Verificar status do pagamento via API
async function checkPaymentStatus(paymentId) {
    try {
        const response = await fetch(`/payment-status/${paymentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const newStatus = result.data.status;
            
            // Só atualizar se o status mudou
            if (newStatus !== currentPaymentStatus) {
                console.log(`📱 Status alterado: ${currentPaymentStatus} → ${newStatus}`);
                updatePaymentStatus(newStatus, result.data);
                
                // Se pagamento foi confirmado ou falhou, parar polling
                if (newStatus === 'confirmed' || newStatus === 'failed' || newStatus === 'expired') {
                    clearInterval(paymentPollingInterval);
                    paymentPollingInterval = null;
                }
            }
        }
        
    } catch (error) {
        console.error('Erro ao verificar status:', error);
    }
}

// Atualizar UI com novo status do pagamento
function updatePaymentStatus(status, paymentData = null) {
    currentPaymentStatus = status;
    const statusElement = document.getElementById('paymentStatus');
    
    if (!statusElement) return;
    
    // Remover classes anteriores
    statusElement.className = '';
    
    switch (status) {
        case 'pending':
            statusElement.textContent = '⏳ Aguardando pagamento...';
            statusElement.className = 'status-pending';
            break;
            
        case 'confirmed':
            statusElement.textContent = '✅ Pagamento confirmado!';
            statusElement.className = 'status-confirmed';
            showPaymentConfirmation(paymentData);
            break;
            
        case 'failed':
            statusElement.textContent = '❌ Pagamento falhou';
            statusElement.className = 'status-failed';
            showPaymentError(paymentData);
            break;
            
        case 'expired':
            statusElement.textContent = '⏰ Pagamento expirado';
            statusElement.className = 'status-expired';
            break;
            
        default:
            statusElement.textContent = '❓ Status desconhecido';
            statusElement.className = 'status-unknown';
    }
    
    console.log(`📊 Status atualizado: ${status}`);
}

// Exibir resultado do pagamento
function displayPaymentResult(paymentData) {
    paymentFormCard.style.display = 'none';
    qrCodeSection.style.display = 'block';
    
    // Atualizar informações básicas
    document.getElementById('paymentMethodTitle').textContent = 
        paymentData.method === 'pix' ? '🏦 Pagamento via PIX' : '₿ Pagamento via Bitcoin Lightning';
    document.getElementById('paymentUserName').textContent = paymentData.userName;
    document.getElementById('paymentAmount').textContent = paymentData.method === 'bitcoin' ? 
        `${paymentData.amount.toLocaleString()} satoshis` : `R$ ${paymentData.amount.toFixed(2)}`;
    
    // Exibir QR Code - usar a imagem gerada pelo servidor
    const qrCodeImage = document.getElementById('qrCodeImage');
    if (paymentData.qrCodeImage) {
        qrCodeImage.src = paymentData.qrCodeImage;
        qrCodeImage.style.display = 'block';
    }
    
    // Iniciar verificação automática de status
    startPaymentStatusPolling(paymentData.paymentId);
    
    const detailsDiv = document.getElementById('paymentDetails');
    
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
            </div>            <p style="font-size: 0.9rem; color: #666;">
                <strong>💡 Como pagar:</strong><br>
                1. Abra seu app bancário<br>
                2. Escaneie o QR Code ou copie o código PIX<br>
                3. Confirme o pagamento<br>
                <em>Pagamento ${sourceText}</em>
            </p>
        `;
    }
    
    // Iniciar verificação automática de status para qualquer método de pagamento
    console.log('🔄 Iniciando polling de status para:', paymentData.paymentId);
    startPaymentStatusPolling(paymentData.paymentId);
}

// Mostrar confirmação de pagamento
function showPaymentConfirmation(paymentData) {
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

// Exibir erro de pagamento
function showPaymentError(paymentData) {
    const qrCodeSection = document.getElementById('qrCodeSection');
    qrCodeSection.style.background = 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)';
    qrCodeSection.style.border = '2px solid #dc3545';
    
    const errorBanner = document.createElement('div');
    errorBanner.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
        ">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">⚠️</div>
            <h3 style="margin: 0; font-size: 1.5rem;">Pagamento Falhou</h3>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">
                ${paymentData?.errorMessage || 'Erro na confirmação do pagamento'}
            </p>
        </div>
    `;
    
    const paymentDetails = document.getElementById('paymentDetails');
    paymentDetails.parentNode.insertBefore(errorBanner, paymentDetails);
    
    updateLocalHistoryStatus(currentPaymentId, 'failed');
}

// Atualizar status no histórico local
function updateLocalHistoryStatus(paymentId, newStatus) {
    try {
        const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
        const paymentIndex = history.findIndex(p => p.id === paymentId);
        
        if (paymentIndex !== -1) {
            history[paymentIndex].status = newStatus;
            history[paymentIndex].confirmedAt = new Date().toISOString();
            localStorage.setItem('paymentHistory', JSON.stringify(history));
            
            // Recarregar histórico na tela
            loadPaymentHistory();
        }
    } catch (error) {
        console.error('Erro ao atualizar histórico:', error);
    }
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
    });    // Event listeners para botões PIX (R$ 1, 2, 3, 4) - Idêntico aos botões Satoshi
    const pixButtons = document.querySelectorAll('.pix-btn');
    pixButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pixValue = parseInt(this.dataset.pix);
            const amountInput = document.getElementById('amount');
            
            // Definir valor em reais
            amountInput.value = pixValue;
            
            // Atualizar visual dos botões
            pixButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            
            // Selecionar PIX automaticamente
            const pixRadio = document.querySelector('input[name="paymentMethod"][value="pix"]');
            if (pixRadio) {
                pixRadio.checked = true;
                updatePaymentInterface('pix');
            }
            
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

// CSS adicional para animações e status
const additionalStyles = `
<style>
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.status-pending {
    color: #ffc107;
    font-weight: bold;
    animation: pulse 2s infinite;
}

.status-confirmed {
    color: #28a745;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(40, 167, 69, 0.3);
}

.status-failed {
    color: #dc3545;
    font-weight: bold;
}

.status-expired {
    color: #6c757d;
    font-weight: bold;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
</style>
`;

// Injetar CSS adicional
document.head.insertAdjacentHTML('beforeend', additionalStyles);
