// Correção para o problema de exibição do QR code no frontend
// Este arquivo deve substituir o script.js original após testes

let currentPaymentId = null;
let currentUniqueId = null;
let paymentPollingInterval = null;
let currentPaymentStatus = 'pending';

// Configurações Bitcoin - Apenas Satoshis
const BITCOIN_CONFIG = {
    MIN_SATOSHIS: 100,
    PREDEFINED_VALUES: [100, 200, 300, 400]
};

// Configurações PIX - Valores em Reais
const PIX_CONFIG = {
    MIN_REAIS: 1,
    PREDEFINED_VALUES: [1, 2, 3, 4]
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
        uniqueIdGroup.style.display = 'block';
        currentUniqueId = generateUniqueId();
        uniqueIdInput.value = currentUniqueId;
        
        amountLabel.textContent = '⚡ Valor (Satoshis):';
        amountInput.min = BITCOIN_CONFIG.MIN_SATOSHIS;
        amountInput.step = '1';
        amountInput.placeholder = '1000';
        
        satoshiValues.style.display = 'block';
        if (pixValues) pixValues.style.display = 'none';
    } else if (paymentMethod === 'pix') {
        uniqueIdGroup.style.display = 'block';
        currentUniqueId = generatePixUniqueId();
        uniqueIdInput.value = currentUniqueId;
        
        amountLabel.textContent = '💵 Valor (R$):';
        amountInput.min = '1';
        amountInput.step = '1';
        amountInput.placeholder = '2';
        
        if (pixValues) pixValues.style.display = 'block';
        satoshiValues.style.display = 'none';
    } else {
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
        uniqueId: currentUniqueId
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
        
        if (result.success) {
            currentPaymentId = result.data.paymentId;
            
            // Modificar resposta para garantir compatibilidade com ambientes locais e produção
            const responseData = result.data;
            
            // Garantir que temos os dados necessários para QR code
            ensureQRCodeData(responseData, paymentMethod);
            
            // Exibir resultado com os dados tratados
            displayPaymentResult(responseData);
            
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

// Garantir que temos os dados necessários para exibir o QR code
function ensureQRCodeData(responseData, paymentMethod) {
    // Se já temos URL do QR code e ela parece válida, não precisamos fazer nada
    if (responseData.qrCodeImage && typeof responseData.qrCodeImage === 'string' && 
        (responseData.qrCodeImage.startsWith('http') || responseData.qrCodeImage.startsWith('data:image'))) {
        console.log('QR code URL válida encontrada:', responseData.qrCodeImage.substring(0, 50) + '...');
        return;
    }
    
    console.log('QR code URL ausente ou inválida, gerando alternativa...');
    
    // Determinar o texto para o QR code baseado no método de pagamento
    let qrCodeText = '';
    
    if (paymentMethod === 'pix' && responseData.pixCode) {
        qrCodeText = responseData.pixCode;
        console.log('Usando código PIX para gerar QR code alternativo');
    } else if (paymentMethod === 'bitcoin') {
        qrCodeText = responseData.lightningInvoice || responseData.bitcoinUri || '';
        console.log('Usando Bitcoin Invoice/URI para gerar QR code alternativo');
    } else {
        // Fallback para casos extremos - usa o ID do pagamento
        qrCodeText = `Payment ID: ${responseData.paymentId}`;
        console.log('Usando ID do pagamento como fallback para QR code');
    }
    
    // Gerar URL para QR code usando API externa
    responseData.qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeText)}`;
    console.log('QR code URL gerada:', responseData.qrCodeImage.substring(0, 50) + '...');
    
    // Garantir que temos o texto do QR code também
    responseData.qrCodeText = qrCodeText;
}

// Salvar no histórico local (Bitcoin e PIX)
function saveToLocalHistory(payment) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));
}

// Carregar histórico de pagamentos (Bitcoin e PIX)
function loadPaymentHistory() {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const historyList = document.getElementById('historyList');
    const stats = document.getElementById('paymentStats');
    
    if (payments.length === 0) {
        historyList.innerHTML = '<p class="no-data">Nenhum pagamento encontrado no histórico local.</p>';
        stats.innerHTML = '';
        return;
    }
    
    // Estatísticas simples
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const confirmedCount = payments.filter(p => p.status === 'confirmed').length;
    
    stats.innerHTML = `
        <p><strong>Total de Pagamentos:</strong> ${payments.length}</p>
        <p><strong>Pendentes:</strong> ${pendingCount} | <strong>Confirmados:</strong> ${confirmedCount}</p>
        <p><strong>Valor Total:</strong> ${totalAmount.toFixed(2)}</p>
    `;
    
    // Lista de pagamentos
    historyList.innerHTML = payments.map(payment => `
        <div class="history-item ${payment.status}">
            <div class="history-info">
                <span class="history-id">${payment.uniqueId || payment.id}</span>
                <span class="history-name">${payment.userName}</span>
                <span class="history-amount">${payment.method === 'bitcoin' ? 
                    `${payment.amount} satoshis` : `R$ ${payment.amount.toFixed(2)}`}</span>
                <span class="history-status ${payment.status}">${
                    payment.status === 'confirmed' ? '✅ Confirmado' : 
                    payment.status === 'pending' ? '⏳ Pendente' : '❓ Desconhecido'
                }</span>
            </div>
            <div class="history-actions">
                <button onclick="checkPaymentStatus('${payment.id}')" class="btn-small">
                    🔄 Verificar
                </button>
            </div>
        </div>
    `).join('');
}

// Mostrar/ocultar loading
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    paymentFormCard.style.display = show ? 'none' : 'block';
}

// Sistema de verificação automática de status de pagamento
function startPaymentStatusPolling(paymentId) {
    // Limpar intervalo anterior se existir
    if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
        paymentPollingInterval = null;
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
}

// Verificar status do pagamento via API
async function checkPaymentStatus(paymentId) {
    if (!paymentId) {
        if (currentPaymentId) {
            paymentId = currentPaymentId;
        } else {
            return;
        }
    }
    
    try {
        const response = await fetch(`/payment-status/${paymentId}`);
        const result = await response.json();
        
        if (result.success) {
            updatePaymentStatus(result.status, result.data);
        }
    } catch (error) {
        console.error('Erro ao verificar status:', error);
    }
}

// Atualizar UI com novo status do pagamento
function updatePaymentStatus(status, paymentData = null) {
    currentPaymentStatus = status;
    const statusElement = document.getElementById('paymentStatus');
    
    // Remover classes anteriores
    statusElement.classList.remove('status-pending', 'status-confirmed', 'status-expired', 'status-error');
    
    if (status === 'pending') {
        statusElement.textContent = 'Aguardando pagamento';
        statusElement.classList.add('status-pending');
    } else if (status === 'confirmed' || status === 'completed') {
        statusElement.textContent = '✅ Pagamento confirmado';
        statusElement.classList.add('status-confirmed');
        
        // Parar polling
        if (paymentPollingInterval) {
            clearInterval(paymentPollingInterval);
            paymentPollingInterval = null;
        }
        
        // Mostrar confirmação
        if (paymentData) {
            showPaymentConfirmation(paymentData);
        }
        
        // Atualizar histórico local
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        const index = payments.findIndex(p => p.id === currentPaymentId);
        if (index !== -1) {
            payments[index].status = 'confirmed';
            localStorage.setItem('payments', JSON.stringify(payments));
        }
    } else if (status === 'expired') {
        statusElement.textContent = '⏰ Pagamento expirado';
        statusElement.classList.add('status-expired');
    } else {
        statusElement.textContent = '❌ Erro no pagamento';
        statusElement.classList.add('status-error');
    }
    
    console.log(`Status atualizado: ${status}`);
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
    
    // Exibir QR Code - usar a imagem gerada pelo servidor, com tratamento de erro aprimorado
    const qrCodeImage = document.getElementById('qrCodeImage');
    if (paymentData.qrCodeImage) {
        qrCodeImage.src = paymentData.qrCodeImage;
        qrCodeImage.style.display = 'block';
        
        // Adicionar tratamento de erro
        qrCodeImage.onerror = function() {
            console.error('Erro ao carregar imagem do QR code:', paymentData.qrCodeImage);
            
            // Tentar URL alternativa caso a primeira falhe
            const alternativeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${
                encodeURIComponent(paymentData.pixCode || paymentData.lightningInvoice || paymentData.bitcoinUri || currentPaymentId)
            }`;
            
            console.log('Tentando URL alternativa para QR code:', alternativeUrl);
            this.src = alternativeUrl;
            
            // Se o segundo método também falhar
            this.onerror = function() {
                console.error('Falha também na URL alternativa');
                this.style.display = 'none';
                
                // Mostrar mensagem ao usuário
                const qrContainer = document.querySelector('.qr-container');
                const errorMsg = document.createElement('p');
                errorMsg.innerHTML = `
                    <strong style="color: #dc3545;">⚠️ Não foi possível exibir o QR code</strong><br>
                    Por favor, utilize o código ${paymentData.method === 'pix' ? 'PIX' : 'Bitcoin'} abaixo.
                `;
                qrContainer.appendChild(errorMsg);
            };
        };
    }
    
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
            <p>Seu pagamento foi confirmado com sucesso.</p>
            <button onclick="this.closest('.payment-confirmation').remove()">Fechar</button>
        </div>
    `;
    document.body.appendChild(confirmationDiv);
}

// Exibir erro de pagamento
function showPaymentError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'payment-confirmation'; // Reutilizar o estilo
    errorDiv.innerHTML = `
        <div class="confirmation-content" style="border-top: 5px solid #dc3545;">
            <h3>❌ Erro no Pagamento</h3>
            <p>${message}</p>
            <button onclick="this.closest('.payment-confirmation').remove()">Fechar</button>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

// Limpar histórico
function clearHistory() {
    if (confirm('Tem certeza que deseja limpar todo o histórico de pagamentos? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('payments');
        loadPaymentHistory();
    }
}

// Novo pagamento
function newPayment() {
    // Resetar variáveis
    currentPaymentId = null;
    stopStatusPolling();
    
    // Limpar formulário
    paymentForm.reset();
    
    // Mostrar formulário e ocultar QR code
    paymentFormCard.style.display = 'block';
    qrCodeSection.style.display = 'none';
    
    // Remover mensagem de sucesso se existir
    const successMessage = document.querySelector('.payment-confirmation');
    if (successMessage) {
        successMessage.remove();
    }
    
    // Rolar para o topo
    window.scrollTo(0, 0);
    
    // Inicializar com o método selecionado
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedMethod) {
        updatePaymentInterface(selectedMethod.value);
    }
}

// Parar polling de status
function stopStatusPolling() {
    if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
        paymentPollingInterval = null;
    }
}

// Exportar pagamentos
function exportPayments() {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    if (payments.length === 0) {
        alert('Não há pagamentos para exportar.');
        return;
    }
    
    const dataStr = JSON.stringify(payments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportDate = new Date().toISOString().slice(0, 10);
    const exportFileName = `livetip-pagamentos-${exportDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.style.display = 'none';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
}

// Copiar para área de transferência
function copyToClipboard(text, message) {
    // Criar elemento temporário
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    
    // Selecionar e copiar
    temp.select();
    document.execCommand('copy');
    
    // Remover elemento
    document.body.removeChild(temp);
    
    // Mostrar mensagem
    alert(message);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Configurar evento de mudança do método de pagamento
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updatePaymentInterface(this.value);
        });
    });
    
    // Inicializar com o método selecionado
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedMethod) {
        updatePaymentInterface(selectedMethod.value);
    }
});
