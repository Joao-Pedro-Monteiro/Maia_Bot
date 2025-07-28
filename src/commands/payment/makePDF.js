const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class MakePDF {
    static MakePDF(studentName) {
        // Formatação do nome e data
        const formatedName = studentName.replace(/\s+/g, '_').toLowerCase();
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10); // AAAA-MM-DD
        const formattedDateBR = now.toLocaleDateString('pt-BR'); // DD/MM/AAAA
        const filename = `boleto_pix_${formatedName}_${formattedDate}.pdf`;

        // Caminhos
        const caminhoPDF = path.join(__dirname, 'docs', filename);
        const caminhoQRCode = path.join(__dirname, 'QRcode.jpg');

        // Dados do curso/pagamento
        const curso = "Desenvolvimento Web Básico";
        const valor = "R$ 150,00";
        const vencimento = "10/08/2025";
        const copiaECola = "00020101021126900014br.gov.bcb.pix0114+55449990908950250Parcela: Curso Desenvolvimento Web Básico - Nimbus5204000053039865406150.005802BR5925JOAO PEDRO DE BRITO MONTE6008BRASILIA62080504SXQR630423EC";

        // Cores do tema
        const colors = {
            primary: '#603ED7',    // Azul moderno
            secondary: '#1e40af',  // Azul escuro
            accent: '#06b6d4',     // Ciano
            text: '#1f2937',       // Cinza escuro
            textLight: '#6b7280',  // Cinza médio
            background: '#f8fafc', // Cinza muito claro
            success: '#059669',    // Verde
            border: '#e5e7eb'      // Cinza claro para bordas
        };

        // Criação do PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 40,
            info: {
                Title: `Boleto do curso para ${studentName}`,
                Author: 'Nimbus Tecnologia Educacional',
                Subject: 'Boleto para pagamento via PIX',
            }
        });

        // Criar diretório se não existir
        if (!fs.existsSync(path.join(__dirname, 'docs'))) {
            fs.mkdirSync(path.join(__dirname, 'docs'), { recursive: true });
        }

        const stream = fs.createWriteStream(caminhoPDF);
        doc.pipe(stream);

        // Função para desenhar retângulos (versão compatível com mobile)
        const drawRect = (x, y, width, height, fillColor, strokeColor = null) => {
            doc.rect(x, y, width, height);
            if (fillColor) {
                doc.fillColor(fillColor).fill();
            }
            if (strokeColor) {
                doc.strokeColor(strokeColor).stroke();
            }
        };

        // Header com fundo colorido
        drawRect(40, 40, doc.page.width - 80, 80, colors.primary);
        
        // Logo/Nome da empresa no header
        doc
            .fillColor('white')
            .fontSize(28)
            .font('Helvetica-Bold')
            .text('NIMBUS', 60, 65, { continued: true })

        // Seção de informações do boleto
        const infoY = 160;
        drawRect(40, infoY, doc.page.width - 80, 120, colors.background, colors.border);

        // Título da seção
        doc
            .fillColor(colors.primary)
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('BOLETO DE PAGAMENTO', 60, infoY + 20);

        // Informações do aluno em duas colunas
        const leftCol = 60;
        const rightCol = 320;
        const lineHeight = 18;
        let currentY = infoY + 50;

        // Coluna esquerda
        doc
            .fillColor(colors.textLight)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('ALUNO:', leftCol, currentY)
            .fillColor(colors.text)
            .fontSize(12)
            .font('Helvetica')
            .text(studentName, leftCol, currentY + 12);

        doc
            .fillColor(colors.textLight)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('CURSO:', leftCol, currentY + 35)
            .fillColor(colors.text)
            .fontSize(12)
            .font('Helvetica')
            .text(curso, leftCol, currentY + 47);

        // Coluna direita
        doc
            .fillColor(colors.textLight)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('VALOR:', rightCol, currentY)
            .fillColor(colors.success)
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(valor, rightCol, currentY + 12);

        doc
            .fillColor(colors.textLight)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('VENCIMENTO:', rightCol, currentY + 35)
            .fillColor(colors.text)
            .fontSize(12)
            .font('Helvetica')
            .text(vencimento, rightCol, currentY + 47);

        // Seção PIX
        const pixY = 320;
        drawRect(40, pixY, doc.page.width - 80, 280, 'white', colors.border);

        // Título PIX com ícone
        doc
            .fillColor(colors.accent)
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('PAGAMENTO VIA PIX', 60, pixY + 20);

        doc
            .fillColor(colors.textLight)
            .fontSize(11)
            .font('Helvetica')
            .text('Escaneie o QR Code ou use o código copia e cola', 60, pixY + 45);

        // Container do QR Code centralizado
        const qrContainerX = (doc.page.width - 180) / 2;
        const qrContainerY = pixY + 70;
        
        drawRect(qrContainerX - 10, qrContainerY - 10, 200, 120, colors.background);

        if (fs.existsSync(caminhoQRCode)) {
            doc.image(caminhoQRCode, qrContainerX, qrContainerY, {
                fit: [180, 100],
                align: 'center'
            });
        } else {
            doc
                .fillColor('red')
                .fontSize(12)
                .text('QR Code não encontrado', qrContainerX, qrContainerY + 40, {
                    width: 180,
                    align: 'center'
                });
        }

        // Seção Copia e Cola
        const copiaColarY = pixY + 200;
        doc
            .fillColor(colors.textLight)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('CÓDIGO COPIA E COLA:', 60, copiaColarY);

        // Container do código com fundo
        drawRect(60, copiaColarY + 15, doc.page.width - 120, 40, colors.background);

        doc
            .fillColor(colors.text)
            .fontSize(9)
            .font('Courier')
            .text(copiaECola, 70, copiaColarY + 25, {
                width: doc.page.width - 140,
                align: 'left',
                lineGap: 2
            });

        // Instruções de pagamento
        const instructionsY = 640;
        drawRect(40, instructionsY, doc.page.width - 80, 80, '#fff3cd', '#ffc107');

        doc
            .fillColor('#856404')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('>> INSTRUÇÕES:', 60, instructionsY + 15);

        doc
            .fontSize(9)
            .font('Helvetica')
            .text('• Abra o app do seu banco e selecione a opção PIX', 60, instructionsY + 30)
            .text('• Escaneie o QR Code ou cole o código acima', 60, instructionsY + 42)
            .text('• Confirme o valor e finalize o pagamento', 60, instructionsY + 54);

        // Rodapé
        const footerY = doc.page.height - 80;
        doc
            .strokeColor(colors.border)
            .lineWidth(1)
            .moveTo(40, footerY)
            .lineTo(doc.page.width - 40, footerY)
            .stroke();

        doc
            .fillColor(colors.textLight)
            .fontSize(9)
            .font('Helvetica')
            .text(`Documento emitido em: ${formattedDateBR}`, 40, footerY + 15)
            .text(`Arquivo: ${filename}`, doc.page.width - 200, footerY + 15, {
                width: 160,
                align: 'right'
            });

        doc.end();

        stream.on('finish', () => {
            console.log(`✅ PDF gerado com sucesso: ${filename}`);
        });

        return { caminhoPDF, filename, title: `Boleto para ${studentName}` };
    }
}

module.exports = MakePDF;