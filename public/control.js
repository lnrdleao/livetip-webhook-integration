// Variáveis globais
let payments = [];
let filteredPayments = [];
let updateInterval = null;
let webhookConnected = false;

// Configurações
const UPDATE_INTERVAL = 5000; // 5 segundos
const API_BASE_URL = window.location.origin;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando página de controle de pagamentos...');
    
    // Iniciar monitoramento
    startMonitoring();
    
    // Configurar filtros
    setupFilters();
    
    // Carregar pagamentos iniciais
    loadPayments();
    
    // Verificar status do webhook
    checkWebhookStatus();
});

// Iniciar monitoramento automático
function startMonitoring() {
    // Atualizar a cada 5 segundos
    updateInterval = setInterval(() => {
        loadPayments();
        checkWebhookStatus();
    }, UPDATE_INTERVAL);
    
    console.log('⏰ Monitoramento automático iniciado');
}

// Carregar pagamentos do servidor
async function loadPayments() {
    try {
        const response = await fetch(`${API_BASE_URL}/payments`);
        const result = await response.json();
        
        if (result.success) {
            payments = result.payments || [];
            
            // Filtrar apenas pagamentos Bitcoin
            payments = payments.filter(p => p.method === 'bitcoin');
            
            // Ordenar por data (mais recentes primeiro)
            payments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            console.log(`📊 Carregados ${payments.length} pagamentos Bitcoin`);
            
            updateStatistics();
            applyFilters();
            updateLastUpdateTime();
        } else {
            console.error('Erro ao carregar pagamentos:', result.error);
        }
    } catch (error) {
        console.error('Erro na requisição de pagamentos:', error);
    }
}

// Atualizar estatísticas
function updateStatistics() {
    const total = payments.length;
    const confirmed = payments.filter(p => p.status === 'confirmed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const totalSats = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    document.getElementById('totalPayments').textContent = total;
    document.getElementById('confirmedPayments').textContent = confirmed;
    document.getElementById('pendingPayments').textContent = pending;
    document.getElementById('totalSatoshis').textContent = totalSats.toLocaleString();
}

// Aplicar filtros
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    
    filteredPayments = payments.filter(payment => {
        // Filtro por status
        if (statusFilter !== 'all' && payment.status !== statusFilter) {
            return false;
        }
        
        // Filtro por data
        if (dateFilter !== 'all') {
            const paymentDate = new Date(payment.timestamp);
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    if (paymentDate.toDateString() !== now.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (paymentDate < weekAgo) return false;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (paymentDate < monthAgo) return false;
                    break;
            }
        }
        
        // Filtro por busca
        if (searchFilter) {
            const searchText = `${payment.userName} ${payment.uniqueId || ''} ${payment.id}`.toLowerCase();
            if (!searchText.includes(searchFilter)) return false;
        }
        
        return true;
    });
    
    renderPayments();
}

// Renderizar pagamentos
function renderPayments() {
    const container = document.getElementById('paymentsContainer');
    
    if (filteredPayments.length === 0) {
        container.innerHTML = `
            <div class="no-payments">
                <p>📋 Nenhum pagamento encontrado</p>
                <p>Verifique os filtros ou aguarde novos pagamentos</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredPayments.map(payment => `
        <div class="payment-row ${payment.status}" data-payment-id="${payment.id}">
            <div class="payment-info">
                <div class="payment-field">
                    <div class="field-label">Data/Hora</div>
                    <div class="field-value">${new Date(payment.timestamp).toLocaleString('pt-BR')}</div>
                </div>
                <div class="payment-field">
                    <div class="field-label">Nome</div>
                    <div class="field-value">${payment.userName}</div>
                </div>
                <div class="payment-field">
                    <div class="field-label">ID Único</div>
                    <div class="field-value" style="font-family: monospace; font-size: 0.9rem;">
                        ${payment.uniqueId || 'N/A'}
                    </div>
                </div>
                <div class="payment-field">
                    <div class="field-label">Valor</div>
                    <div class="field-value">${(payment.amount || 0).toLocaleString()} sats</div>
                </div>
                <div class="payment-field">
                    <div class="field-label">Status</div>
                    <div class="field-value">
                        <span class="status-badge status-${payment.status}">
                            ${getStatusText(payment.status)}
                        </span>
                    </div>
                </div>
                <div class="payment-field">
                    <div class="field-label">Ações</div>
                    <div class="payment-actions">
                        <button class="btn-action btn-check" onclick="checkPaymentStatus('${payment.id}')">
                            🔄 Verificar
                        </button>
                        <button class="btn-action btn-details" onclick="showPaymentDetails('${payment.id}')">
                            📋 Detalhes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Obter texto do status
function getStatusText(status) {
    switch (status) {
        case 'confirmed': return '✅ Confirmado';
        case 'pending': return '⏳ Pendente';
        case 'failed': return '❌ Falhado';
        default: return '❓ Desconhecido';
    }
}

// Verificar status de um pagamento específico
async function checkPaymentStatus(paymentId) {
    try {
        console.log(`🔄 Verificando status do pagamento ${paymentId}...`);
        
        const response = await fetch(`${API_BASE_URL}/payment-status/${paymentId}`);
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ Status obtido: ${result.status}`);
            
            // Atualizar na lista local
            const paymentIndex = payments.findIndex(p => p.id === paymentId);
            if (paymentIndex >= 0) {
                const oldStatus = payments[paymentIndex].status;
                payments[paymentIndex].status = result.status;
                
                // Se status mudou, mostrar notificação
                if (oldStatus !== result.status) {
                    showNotification(`Pagamento ${paymentId.substring(0, 8)}... atualizado para: ${getStatusText(result.status)}`);
                }
            }
            
            // Atualizar interface
            updateStatistics();
            applyFilters();
            
        } else {
            console.error('Erro ao verificar status:', result.error);
            showNotification('Erro ao verificar status do pagamento', 'error');
        }
    } catch (error) {
        console.error('Erro na verificação:', error);
        showNotification('Erro na verificação de status', 'error');
    }
}

// Mostrar detalhes do pagamento
function showPaymentDetails(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
        showNotification('Pagamento não encontrado', 'error');
        return;
    }
    
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="payment-details">
            <h3>💰 Informações do Pagamento</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Payment ID:</strong>
                    <span style="font-family: monospace;">${payment.id}</span>
                </div>
                <div class="detail-item">
                    <strong>ID Único:</strong>
                    <span style="font-family: monospace;">${payment.uniqueId || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Nome:</strong>
                    <span>${payment.userName}</span>
                </div>
                <div class="detail-item">
                    <strong>Valor:</strong>
                    <span>${(payment.amount || 0).toLocaleString()} satoshis</span>
                </div>
                <div class="detail-item">
                    <strong>Status:</strong>
                    <span class="status-badge status-${payment.status}">
                        ${getStatusText(payment.status)}
                    </span>
                </div>
                <div class="detail-item">
                    <strong>Data/Hora:</strong>
                    <span>${new Date(payment.timestamp).toLocaleString('pt-BR')}</span>
                </div>
                <div class="detail-item">
                    <strong>Método:</strong>
                    <span>₿ Bitcoin Lightning</span>
                </div>
            </div>
            
            ${payment.lightningInvoice ? `
                <h4>⚡ Lightning Invoice</h4>
                <div class="invoice-container">
                    <textarea readonly style="width: 100%; height: 100px; font-family: monospace; font-size: 0.8rem;">${payment.lightningInvoice}</textarea>
                    <button onclick="copyToClipboard('${payment.lightningInvoice}', 'Invoice copiado!')" class="btn-primary" style="margin-top: 0.5rem;">
                        📋 Copiar Invoice
                    </button>
                </div>
            ` : ''}
            
            <div class="detail-actions" style="margin-top: 1rem;">
                <button onclick="checkPaymentStatus('${payment.id}')" class="btn-primary">
                    🔄 Verificar Status
                </button>
                <button onclick="closeModal()" class="btn-outline">
                    ❌ Fechar
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('paymentModal').style.display = 'block';
}

// Verificar status do webhook
async function checkWebhookStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/webhook-stats`);
        const result = await response.json();
        
        if (result.success) {
            webhookConnected = true;
            
            const statusEl = document.getElementById('webhookStatus');
            statusEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: #28a745;">🟢 Webhook Conectado</span>
                    <span>Total de eventos: ${result.stats.totalWebhooks || 0}</span>
                    <span>Últimos 24h: ${result.stats.last24h || 0}</span>
                </div>
            `;
        } else {
            webhookConnected = false;
            document.getElementById('webhookStatus').innerHTML = `
                <span style="color: #dc3545;">🔴 Webhook Desconectado</span>
            `;
        }
    } catch (error) {
        webhookConnected = false;
        document.getElementById('webhookStatus').innerHTML = `
            <span style="color: #dc3545;">🔴 Erro de Conexão</span>
        `;
    }
}

// Configurar filtros
function setupFilters() {
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('dateFilter').addEventListener('change', applyFilters);
    document.getElementById('searchFilter').addEventListener('input', applyFilters);
}

// Atualizar manualmente
function refreshPayments() {
    console.log('🔄 Atualizando pagamentos manualmente...');
    loadPayments();
    showNotification('Pagamentos atualizados!');
}

// Exportar pagamentos
function exportPayments() {
    if (filteredPayments.length === 0) {
        showNotification('Nenhum pagamento para exportar', 'warning');
        return;
    }
    
    const csvContent = [
        'Data/Hora,Nome,ID Único,Satoshis,Status,Payment ID',
        ...filteredPayments.map(p => 
            `"${new Date(p.timestamp).toLocaleString('pt-BR')}","${p.userName}","${p.uniqueId || ''}",${p.amount || 0},"${p.status}","${p.id}"`
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pagamentos_bitcoin_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${filteredPayments.length} pagamentos exportados!`);
}

// Limpar todos os pagamentos
function clearAllPayments() {
    if (confirm('⚠️ Tem certeza que deseja limpar todos os pagamentos? Esta ação remove apenas da visualização local, não afeta o servidor.')) {
        payments = [];
        filteredPayments = [];
        updateStatistics();
        renderPayments();
        showNotification('Visualização local limpa!');
    }
}

// Atualizar tempo da última atualização
function updateLastUpdateTime() {
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('pt-BR');
}

// Mostrar notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#28a745'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Copiar para clipboard
function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(successMessage);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        showNotification('Erro ao copiar', 'error');
    });
}

// Fechar modal
function closeModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', function() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
