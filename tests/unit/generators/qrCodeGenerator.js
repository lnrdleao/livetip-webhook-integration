const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');

class QRCodeWithLogo {
    constructor() {
        this.defaultOptions = {
            width: 300,
            height: 300,
            logoSize: 60,
            logoRadius: 8,
            errorCorrectionLevel: 'M',
            margin: 2
        };
    }

    /**
     * Gera QR code com logo no centro
     * @param {string} text - Texto do QR code
     * @param {string} logoPath - Caminho para o logo (opcional)
     * @param {string} logoType - Tipo do logo ('bitcoin', 'pix', ou 'custom')
     * @param {object} options - Opções customizadas
     */
    async generateWithLogo(text, logoType = null, options = {}) {
        const opts = { ...this.defaultOptions, ...options };
        
        try {
            // Gerar QR code básico
            const qrCodeDataUrl = await QRCode.toDataURL(text, {
                width: opts.width,
                height: opts.height,
                errorCorrectionLevel: opts.errorCorrectionLevel,
                margin: opts.margin,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            // Se não tem logo, retorna QR code básico
            if (!logoType) {
                return qrCodeDataUrl;
            }

            // Criar canvas para composição
            const canvas = createCanvas(opts.width, opts.height);
            const ctx = canvas.getContext('2d');

            // Carregar QR code
            const qrImage = await loadImage(qrCodeDataUrl);
            ctx.drawImage(qrImage, 0, 0, opts.width, opts.height);

            // Adicionar logo
            await this.addLogo(ctx, logoType, opts);

            return canvas.toDataURL();

        } catch (error) {
            console.error('Erro ao gerar QR code com logo:', error);
            // Fallback: retorna QR code sem logo
            return await QRCode.toDataURL(text, {
                width: opts.width,
                height: opts.height,
                errorCorrectionLevel: opts.errorCorrectionLevel,
                margin: opts.margin
            });
        }
    }

    /**
     * Adiciona logo ao canvas
     */
    async addLogo(ctx, logoType, options) {
        const centerX = options.width / 2;
        const centerY = options.height / 2;
        const logoSize = options.logoSize;
        const logoRadius = options.logoRadius;

        // Desenhar fundo branco circular para o logo
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 8, 0, 2 * Math.PI);
        ctx.fill();

        // Desenhar borda do logo
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 6, 0, 2 * Math.PI);
        ctx.stroke();

        if (logoType === 'bitcoin') {
            await this.drawBitcoinLogo(ctx, centerX, centerY, logoSize);
        } else if (logoType === 'pix') {
            await this.drawPixLogo(ctx, centerX, centerY, logoSize);
        }
    }

    /**
     * Desenha logo do Bitcoin
     */
    async drawBitcoinLogo(ctx, centerX, centerY, size) {
        const radius = size / 2;
        
        // Fundo laranja do Bitcoin
        ctx.fillStyle = '#F7931A';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Símbolo Bitcoin (₿) estilizado
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${size * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Desenhar "₿"
        ctx.fillText('₿', centerX, centerY);
        
        // Adicionar linhas características do Bitcoin
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = size * 0.05;
        
        // Linha superior
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.15, centerY - size * 0.35);
        ctx.lineTo(centerX + size * 0.05, centerY - size * 0.35);
        ctx.stroke();
        
        // Linha inferior
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.15, centerY + size * 0.35);
        ctx.lineTo(centerX + size * 0.05, centerY + size * 0.35);
        ctx.stroke();
    }

    /**
     * Desenha logo do PIX
     */
    async drawPixLogo(ctx, centerX, centerY, size) {
        const radius = size / 2;
        
        // Fundo do PIX (verde/azul)
        const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
        gradient.addColorStop(0, '#00A0B0');
        gradient.addColorStop(0.5, '#40C4FF');
        gradient.addColorStop(1, '#0091EA');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Desenhar símbolo PIX estilizado
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${size * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Texto "PIX"
        ctx.fillText('PIX', centerX, centerY);
        
        // Desenhar elementos gráficos do PIX
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = size * 0.04;
        
        // Linhas cruzadas características
        const lineSize = size * 0.15;
        
        // Linha diagonal superior esquerda para inferior direita
        ctx.beginPath();
        ctx.moveTo(centerX - lineSize, centerY - lineSize);
        ctx.lineTo(centerX + lineSize, centerY + lineSize);
        ctx.stroke();
        
        // Linha diagonal superior direita para inferior esquerda
        ctx.beginPath();
        ctx.moveTo(centerX + lineSize, centerY - lineSize);
        ctx.lineTo(centerX - lineSize, centerY + lineSize);
        ctx.stroke();
        
        // Pontos nos cantos
        const pointSize = size * 0.06;
        ctx.fillStyle = '#FFFFFF';
        
        // Pontos nos 4 cantos
        const corners = [
            [centerX - lineSize * 1.2, centerY - lineSize * 1.2],
            [centerX + lineSize * 1.2, centerY - lineSize * 1.2],
            [centerX - lineSize * 1.2, centerY + lineSize * 1.2],
            [centerX + lineSize * 1.2, centerY + lineSize * 1.2]
        ];
        
        corners.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

module.exports = QRCodeWithLogo;
