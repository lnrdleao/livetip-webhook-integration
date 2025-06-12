// Versão de debug do script.js para identificar problemas na exibição do QR code
// Copia todas as funções originais, mas adiciona logs detalhados

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

// Função de log melhorada
function debugLog(message, data = null) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[DEBUG ${timestamp}] ${message}`);
    if (data) {
        console.log(data);
    }
}

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
    debugLog(`Atualizando interface para método: ${paymentMethod}`);
    
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
    debugLog("Formulário de pagamento enviado");
    
    const formData = new FormData(paymentForm);
    const paymentMethod = formData.get('paymentMethod');
    const amount = parseFloat(formData.get('amount'));
    
    debugLog("Dados do formulário:", {
        userName: formData.get('userName'),
        amount,
        paymentMethod,
        uniqueId: currentUniqueId
    });
    
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
        debugLog("Enviando requisição para /generate-qr");
        
        const response = await fetch('/generate-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        debugLog("Resposta recebida, status:", response.status);
        
        // Obter o texto bruto da resposta para debug
        const responseText = await response.text();
        debugLog("Resposta bruta:", responseText.substring(0, 200) + (responseText.length > 200 ? "..." : ""));
        
        // Tentar analisar como JSON
        let result;
        try {
            result = JSON.parse(responseText);
            debugLog("JSON analisado com sucesso");
        } catch (jsonError) {
            debugLog("ERRO: Falha ao analisar JSON", jsonError);
            alert("Erro na resposta do servidor: formato inválido");
            showLoading(false);
            return;
        }
        
        if (result.success) {
            debugLog("Resposta bem-sucedida", result.data);
            
            // Verificar se temos paymentId na resposta
            if (!result.data.paymentId) {
                debugLog("AVISO: paymentId ausente na resposta!");
            }
            
            currentPaymentId = result.data.paymentId;
            
            // Verificação importante: a URL do QR code está presente?
            if (!result.data.qrCodeImage) {
                debugLog("ERRO: qrCodeImage ausente na resposta!");
            } else {
                debugLog("QR code URL:", result.data.qrCodeImage.substring(0, 50) + "...");
            }
            
            // Chamar função para exibir o resultado
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
            debugLog("Erro na resposta:", result.error);
            alert('Erro ao gerar QR Code: ' + result.error);
        }
    } catch (error) {
        debugLog("ERRO na requisição:", error);
        alert('Erro na requisição: ' + error.message);
    } finally {
        showLoading(false);
    }
});

// Salvar no histórico local (Bitcoin e PIX)
function saveToLocalHistory(payment) {
    debugLog("Salvando no histórico local:", payment);
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));
}

// Mostrar/ocultar loading
function showLoading(show) {
    debugLog(`${show ? 'Exibindo' : 'Ocultando'} indicador de loading`);
    loading.style.display = show ? 'block' : 'none';
    paymentFormCard.style.display = show ? 'none' : 'block';
}

// Sistema de verificação automática de status de pagamento
function startPaymentStatusPolling(paymentId) {
    debugLog("Iniciando polling para paymentId:", paymentId);
    
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
            debugLog("Verificando status do pagamento...");
            await checkPaymentStatus(paymentId);
        } catch (error) {
            debugLog("ERRO na verificação de status:", error);
        }
    }, 5000);
}

// Verificar status do pagamento via API
async function checkPaymentStatus(paymentId) {
    if (!paymentId) {
        if (currentPaymentId) {
            paymentId = currentPaymentId;
        } else {
            debugLog("ERRO: Tentativa de verificar status sem ID de pagamento");
            return;
        }
    }
    
    debugLog(`Verificando status do pagamento: ${paymentId}`);
    
    try {
        const response = await fetch(`/payment-status/${paymentId}`);
        const result = await response.json();
        
        debugLog("Status recebido:", result);
        
        if (result.success) {
            updatePaymentStatus(result.status, result.data);
        } else {
            debugLog("Erro ao verificar status:", result.error);
        }
    } catch (error) {
        debugLog("ERRO na verificação de status:", error);
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
    
    debugLog(`Status atualizado: ${status}`);
}

// Exibir resultado do pagamento
function displayPaymentResult(paymentData) {
    debugLog("Exibindo resultado do pagamento:", paymentData);
    
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
    debugLog("URL do QR Code:", paymentData.qrCodeImage || "AUSENTE!");
    
    try {
        if (paymentData.qrCodeImage) {
            // Validar URL do QR code
            if (typeof paymentData.qrCodeImage !== 'string' || !paymentData.qrCodeImage.startsWith('http')) {
                debugLog("AVISO: URL do QR code parece inválida:", paymentData.qrCodeImage);
            }
            
            qrCodeImage.src = paymentData.qrCodeImage;
            qrCodeImage.style.display = 'block';
            
            // Adicionar event listeners para depurar problemas de carregamento da imagem
            qrCodeImage.onload = () => debugLog("✅ Imagem do QR code carregada com sucesso");
            qrCodeImage.onerror = (e) => {
                debugLog("❌ ERRO ao carregar imagem do QR code:", e);
                // Tentar carregar novamente com URL alternativa
                if (paymentData.qrCodeImage && paymentData.qrCodeImage.includes('api.qrserver.com')) {
                    debugLog("Tentando URL alternativa para o QR code");
                    qrCodeImage.src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(paymentData.qrCodeText || paymentData.pixCode || '')}`;
                }
            };
        } else {
            debugLog("❌ URL do QR code não fornecida, usando gerador alternativo");
            // QR code não fornecido pelo servidor, gerar alternativo
            if (paymentData.pixCode || paymentData.qrCodeText) {
                const qrCodeContent = paymentData.qrCodeText || paymentData.pixCode;
                qrCodeImage.src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(qrCodeContent)}`;
                qrCodeImage.style.display = 'block';
            } else {
                debugLog("❌ Impossível gerar QR code, nenhum conteúdo disponível");
            }
        }
    } catch (qrError) {
        debugLog("❌ Erro ao processar QR code:", qrError);
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
    debugLog('Iniciando polling de status para:', paymentData.paymentId);
    startPaymentStatusPolling(paymentData.paymentId);
}

// Utilidade para copiar texto para a área de transferência
function copyToClipboard(text, message) {
    debugLog("Copiando para área de transferência:", text.substring(0, 30) + "...");
    
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
    debugLog("DOM carregado, inicializando script de debug");
    
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
    
    // Verificar se a imagem do QR code existe e está funcionando
    const qrCodeImage = document.getElementById('qrCodeImage');
    if (qrCodeImage) {
        debugLog("Elemento de imagem QR code encontrado");
    } else {
        debugLog("ERRO: Elemento de imagem QR code não encontrado no DOM");
    }
});

debugLog("Script de debug carregado com sucesso");
