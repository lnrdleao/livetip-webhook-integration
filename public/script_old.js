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
        
        const response = await fetch('/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentPaymentId = result.paymentId;
            displayPayment(result);
        } else {
            alert('Erro ao criar pagamento: ' + result.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar pagamento');
    } finally {
        showLoading(false);
    }
});

// Exibir pagamento criado
function displayPayment(paymentData) {
    // Ocultar formulário e mostrar QR code
    paymentFormCard.style.display = 'none';
    qrCodeSection.style.display = 'block';
    
    // Atualizar elementos com dados da resposta da LiveTip API
    document.getElementById('qrCodeImage').src = paymentData.qrCodeImage;
    document.getElementById('paymentMethodTitle').textContent = 
        paymentData.paymentData.method === 'pix' ? '🏦 Pagamento via PIX' : '₿ Pagamento via Bitcoin Lightning';
    document.getElementById('paymentUserName').textContent = paymentData.paymentData.userName;
    document.getElementById('paymentAmount').textContent = paymentData.paymentData.amount.toFixed(2);      // Detalhes específicos do método de pagamento
    const detailsDiv = document.getElementById('paymentDetails');
    if (paymentData.paymentData.method === 'pix') {
        const isLiveTip = paymentData.paymentData.source === 'livetip';
        const sourceText = isLiveTip ? 'processado pela LiveTip' : 'geração local (fallback)';
        
        detailsDiv.innerHTML = `
            <p><strong>🏦 Pagamento PIX ${isLiveTip ? 'via LiveTip' : '(Local)'}</strong></p>
            ${paymentData.paymentData.pixKey ? `<p><strong>Chave PIX:</strong> ${paymentData.paymentData.pixKey}</p>` : ''}
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 5px 0;">
                <p><strong>📱 Código PIX:</strong></p>
                <textarea readonly style="width: 100%; height: 80px; font-family: monospace; font-size: 0.8rem; resize: vertical;" 
                    onclick="this.select()">${paymentData.paymentData.pixCode || 'Carregando...'}</textarea>
                <button onclick="copyToClipboard('${paymentData.paymentData.pixCode || ''}', 'Código PIX copiado!')" 
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
        `;    } else {
        const isLiveTip = paymentData.paymentData.source === 'livetip';
        const sourceText = isLiveTip ? 'processado pela LiveTip' : 'geração local (fallback)';
        const codeLabel = isLiveTip ? 'Lightning Invoice' : 'Bitcoin URI';
        const code = paymentData.paymentData.lightningInvoice || paymentData.paymentData.bitcoinUri || '';
        
        // Calcular satoshis se não estiver disponível
        const satoshis = paymentData.paymentData.satoshis || BITCOIN_CONFIG.brlToSatoshis(paymentData.paymentData.amount);
        
        detailsDiv.innerHTML = `
            <p><strong>₿ Bitcoin ${isLiveTip ? 'Lightning via LiveTip' : '(Local)'}</strong></p>
            <p><strong>⚡ Valor em Satoshis:</strong> ${satoshis.toLocaleString()} sats</p>
            ${paymentData.paymentData.bitcoinAddress ? `<p><strong>Endereço:</strong> ${paymentData.paymentData.bitcoinAddress}</p>` : ''}
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
                <em>Pagamento ${sourceText}</em>
            </p>
        `;
    }
    
    // Iniciar verificação automática de status
    startStatusPolling();
}

// Verificar status do pagamento
async function checkPaymentStatus() {
    if (!currentPaymentId) return;
    
    try {
        const response = await fetch(`/payment-status/${currentPaymentId}`);
        const payment = await response.json();
        
        const statusElement = document.getElementById('paymentStatus');
        
        // Atualizar status
        statusElement.className = `status-${payment.status}`;
        
        switch (payment.status) {
            case 'pending':
                statusElement.textContent = '⏳ Aguardando pagamento';
                break;
            case 'completed':
                statusElement.textContent = '✅ Pagamento confirmado';
                showSuccessMessage();
                break;
            case 'failed':
                statusElement.textContent = '❌ Pagamento falhou';
                break;
            default:
                statusElement.textContent = `📊 Status: ${payment.status}`;
        }
        
        return payment.status;
    } catch (error) {
        console.error('Erro ao verificar status:', error);
    }
}

// Polling automático de status
let statusPollingInterval = null;

function startStatusPolling() {
    // Verificar a cada 5 segundos
    statusPollingInterval = setInterval(async () => {
        const status = await checkPaymentStatus();
        
        // Parar polling se pagamento foi concluído ou falhou
        if (status === 'completed' || status === 'failed') {
            clearInterval(statusPollingInterval);
        }
    }, 5000);
}

function stopStatusPolling() {
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
    }
}

// Mostrar mensagem de sucesso
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="background: #d4edda; color: #155724; padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: center;">
            <h3>🎉 Pagamento Confirmado!</h3>
            <p>Seu pagamento foi processado com sucesso.</p>
        </div>
    `;
    
    qrCodeSection.appendChild(successDiv);
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
    const successMessage = document.querySelector('.success-message');
    if (successMessage) {
        successMessage.remove();
    }
    
    // Rolar para o topo
    window.scrollTo(0, 0);
}

// Mostrar/ocultar loading
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    paymentFormCard.style.display = show ? 'none' : 'block';
}

// Carregar histórico de pagamentos
async function loadPaymentHistory() {
    try {
        const response = await fetch('/payments');
        const payments = await response.json();
        
        const historyList = document.getElementById('historyList');
        
        if (payments.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666;">Nenhum pagamento encontrado.</p>';
            return;
        }
        
        historyList.innerHTML = payments.map(payment => `
            <div class="history-item">
                <h4>${payment.userName}</h4>
                <p><strong>Método:</strong> ${payment.method === 'pix' ? 'PIX' : 'Bitcoin'}</p>
                <p><strong>Valor:</strong> R$ ${payment.amount.toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="status-${payment.status}">${getStatusText(payment.status)}</span></p>
                <p><strong>Data:</strong> ${new Date(payment.createdAt).toLocaleString('pt-BR')}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        alert('Erro ao carregar histórico de pagamentos');
    }
}

// Converter status para texto legível
function getStatusText(status) {
    switch (status) {
        case 'pending': return '⏳ Pendente';
        case 'completed': return '✅ Concluído';
        case 'failed': return '❌ Falhou';
        default: return status;
    }
}

// Formatação de valor em tempo real
document.getElementById('amount').addEventListener('input', function(e) {
    let value = e.target.value;
    
    // Remover caracteres não numéricos exceto ponto
    value = value.replace(/[^0-9.]/g, '');
    
    // Permitir apenas um ponto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar a 2 casas decimais
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    e.target.value = value;
});

// Limpar polling quando a página for fechada
window.addEventListener('beforeunload', () => {
    stopStatusPolling();
});

// Função para copiar texto para a área de transferência
function copyToClipboard(text, successMessage) {
    if (!text) {
        alert('Nada para copiar');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        // Mostrar feedback visual
        const originalText = event.target.textContent;
        event.target.textContent = '✅ Copiado!';
        event.target.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            event.target.textContent = originalText;
            event.target.style.backgroundColor = event.target.style.backgroundColor.includes('007bff') ? '#007bff' : '#f7931a';
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert(successMessage || 'Texto copiado!');
        } catch (err) {
            alert('Não foi possível copiar. Copie manualmente.');
        }
        document.body.removeChild(textArea);
    });
}

// Event listeners para métodos de pagamento
document.addEventListener('DOMContentLoaded', function() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const satoshiValues = document.getElementById('satoshiValues');
    const amountInput = document.getElementById('amount');
    
    // Mostrar/esconder valores em satoshis baseado no método selecionado
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'bitcoin') {
                satoshiValues.style.display = 'block';
                updateSatoshiValues();
                // Ajustar validação para Bitcoin
                amountInput.min = '0.01';
                amountInput.placeholder = 'Ou use os valores em satoshis abaixo';
            } else {
                satoshiValues.style.display = 'none';
                // Voltar validação para PIX
                amountInput.min = '0.01';
                amountInput.placeholder = '10.00';
            }
        });
    });
    
    // Event listeners para botões de satoshis
    const satoshiButtons = document.querySelectorAll('.satoshi-btn');
    satoshiButtons.forEach(button => {
        button.addEventListener('click', function() {
            const satoshis = parseInt(this.dataset.sats);
            const brlValue = BITCOIN_CONFIG.satoshisToBRL(satoshis);
            
            // Atualizar campo de valor
            amountInput.value = brlValue.toFixed(2);
            
            // Atualizar visual dos botões
            satoshiButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            
            // Adicionar feedback visual
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Atualizar valores em satoshis quando o campo amount mudar
    amountInput.addEventListener('input', function() {
        if (document.querySelector('input[name="paymentMethod"]:checked').value === 'bitcoin') {
            updateSatoshiButtonHighlight();
        }
    });
});

// Função para atualizar os valores em BRL dos botões de satoshis
function updateSatoshiValues() {
    const satoshiValues = [1000, 2100, 5000, 10000];
    
    satoshiValues.forEach(sats => {
        const brlValue = BITCOIN_CONFIG.satoshisToBRL(sats);
        const element = document.getElementById(`sats-${sats}-brl`);
        if (element) {
            element.textContent = `~R$ ${brlValue.toFixed(2)}`;
        }
    });
}

// Função para destacar o botão de satoshi correspondente ao valor digitado
function updateSatoshiButtonHighlight() {
    const amountInput = document.getElementById('amount');
    const currentValue = parseFloat(amountInput.value);
    
    if (isNaN(currentValue)) return;
    
    const currentSatoshis = BITCOIN_CONFIG.brlToSatoshis(currentValue);
    const satoshiButtons = document.querySelectorAll('.satoshi-btn');
    
    // Remover seleção de todos os botões
    satoshiButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Encontrar botão correspondente (com tolerância de ±50 satoshis)
    satoshiButtons.forEach(button => {
        const buttonSatoshis = parseInt(button.dataset.sats);
        if (Math.abs(currentSatoshis - buttonSatoshis) <= 50) {
            button.classList.add('selected');
        }
    });
}
