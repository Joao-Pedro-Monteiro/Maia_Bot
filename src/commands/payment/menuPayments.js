const { delay } = require('baileys');
const MessageHandler = require('../../middlewares/messageHandler.js');
const MakePDF = require('./makePDF').MakePDF;
const student = new Object();

const financialManager_Vcard = (
    'BEGIN:VCARD\n' // metadata of the contact card
    + 'VERSION:3.0\n' 
    + 'FN:Sandro\n' // full name
    + 'ORG:Nimbus\n' // the organization of the contact
    + 'TEL;type=CELL;type=VOICE;waid=554598365628:+55 4598365628\n' // WhatsApp ID + phone number
    + 'END:VCARD'
);

class MenuPayments{
    static async execute(userInput, state) {
        userInput = userInput.toLowerCase()
        if(userInput === 'q') {
            return this.resetAndReturnToMain(state);
        }

        if(userInput !== 'q'){
            switch (student.lastQeuestion) {
                case 'course':
                    switch(userInput) {
                        case '1':
                            student.course = 'Desenvolvimento Web Básico';
                            student.lastQeuestion = 'name';
                            return "Ótimo, para gerar sua fatura, preciso que me informe nome completo."
                        default:
                            return "⚠️ Opção inválida. Por favor, escolha uma opção válida ou digite `Q` para voltar ao menu principal.";
                    }
                case 'name':
                    try {
                        student.name = userInput;
                        student.lastQeuestion = 'emission';
                        const { caminhoPDF, filename, title } = MakePDF(student.name); // ⬅️ Desestrutura o retorno
                        await delay(2000); // Aguarda 2 segundos antes de enviar o documento
                        return [
                            {
                                document: { url: caminhoPDF },
                                mimetype: 'application/pdf',
                                fileName: filename,
                                caption: `📄 ${title}`
                            },
                            {text: `Apos o pagamento, envie o comprovante para o responsável financeiro, vou te enviar o contato dele...`,},
                            {contacts: { 
                                displayName: 'Financeiro Nimbus',
                                contacts: [{vcard: financialManager_Vcard}]
                                }
                            }

                        ];
                    } catch (error) {
                        console.error('Erro ao gerar PDF:', error);
                        return "⚠️ Ocorreu um erro ao gerar o PDF. Por favor, tente novamente mais tarde e avise um professor.";
                    }

                default:
                    return "⚠️ Opção inválida. Por favor, escolha uma opção válida ou digite `Q` para voltar ao menu principal.";
            }
        }
    }

    static resetAndReturnToMain(state) {
        this.resetState(state);
        return null; // Retorna null para que o MessageHandler reinicie o menu principal
    }

    static resetState(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: false,
            selectedCity: null,
            previousInput: null
        });
        return null;
    }

    static getMenu() {
        student.lastQeuestion = 'course';
        return this.formatMenu({
            title: "Me informe qual o curso que deseja pagar a mensalidade:",
            options: {
                '1': "Curso Desenvolvimento Web Básico",
            }
        });
    }

    static formatMenu(menuData) {
        let response = `${menuData.title}\n\n`;
        Object.entries(menuData.options).forEach(([key, value]) => {
            response += `*${key}* - ${value}\n`;
        });
        return response;
    }
    
    static sendMessage(from, item){
        try{
            MessageHandler.sock.sendMessage(from, item)
        } catch (error) {
            console.error('Erro ao enviar mensagem ao gerente financeiro:', error);
        }
    }
}
module.exports = MenuPayments;

