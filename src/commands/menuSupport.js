const teacher_Vcard = (
    'BEGIN:VCARD\n' // metadata of the contact card
    + 'VERSION:3.0\n' 
    + 'FN:João Pedro Monteiro\n' // full name
    + 'ORG:Nimbus\n' // the organization of the contact
    + 'TEL;type=CELL;type=VOICE;waid=554499090895:+55 4499090895\n' // WhatsApp ID + phone number
    + 'END:VCARD'
);
const financialManager_Vcard = (
    'BEGIN:VCARD\n' // metadata of the contact card
    + 'VERSION:3.0\n' 
    + 'FN:Sandro\n' // full name
    + 'ORG:Nimbus\n' // the organization of the contact
    + 'TEL;type=CELL;type=VOICE;waid=554598365628:+55 4598365628\n' // WhatsApp ID + phone number
    + 'END:VCARD'
);

const e = require('express');
//! Este bloco configura a função de envio de mensagens como é feito pelo Handler de mensagens
const Handler = require('../middlewares/MessageHandler.js');
const { text } = require('pdfkit');
sendMessage(from, item) = Handler.sock.sendMessage(from, item)

let addingSupportMessage = false;

class MenuSupport {
    static async execute(userInput, state) {
        if (userInput && userInput.toLowerCase() === 'q') {
            return MenuSupport.resetAndReturnToMain(state);
        }

        if (userInput && state.currentMenu === 'support' && !isNaN(userInput) && !addingSupportMessage) {
            switch(userInput) {
                case 1:
                    MenuSupport.resetState(state)
                    return [
                        {
                            contacts: { 
                                displayName: 'Sandro - Financeiro Nimbus',
                                contacts: [{vcard: financialManager_Vcard}]
                            }
                        },
                        {
                            text: `💼 Aqui está o contato para suporte comercial.\nLigue para nós ou envie uma mensagem!`
                        },
                        {text: '_Atendimento Encerrado_ \n👋 Obrigado por usar nossos serviços. Até logo!'}
                    ];

                case 2:
                    MenuSupport.resetState(state)
                    return [
                        {
                            contacts: { 
                                displayName: 'João Pedro Monteiro',
                                contacts: [{vcard: teacher_Vcard_Vcard}]
                            }
                        },
                        {
                            text: '💼 Aqui está o contato para suporte financeiro.\nNos envie uma mensagem! \n\n'
                        },
                        {text: '_Seu atendimento foi encerrado_ \n👋 Até logo!'}
                    ];

                case 3:
                    addingSupportMessage = true; //* Ativa a flag de mensagem de suporte
                    return "📝 Me diga qual problema você está enfrentando e enviarei para o responsável. Mais tarde ele entrará em contato para te ajudar.";

                default:
                    return "⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n" + MenuSupport.getMenu();
            }
        } else if (userInput && state.currentMenu === 'support' && addingSupportMessage) {
            //! SE O USUÁRIO DESEJA ENVIAR UMA MENSAGEM AO SUPORTE...

            if (userInput.trim() === '') {
                return "⚠️ Mensagem vazia. Por favor, digite sua mensagem.";
            }

            let response = MenuSupport.addSupportMessage(userInput);
            if (response === "OK") {
                MenuSupport.resetAndReturnToMain(state)
                return[
                    {text: "✅ Sua mensagem foi enviada com sucesso! O responsável entrará em contato em breve."},
                    {text: "_Seu atendimento foi encerrado_ \n👋 Até logo!"}
                ]
            }else{
                MenuSupport.resetAndReturnToMain(state)
                return response
            }
        }
        
        // Se chegou até aqui, exibe o menu principal de suporte
        state.currentMenu = 'suporte';
        return MenuSupport.getMenu();
    }

    static addSupportMessage(userInput, state) {
        message = userInput.trim();
        if (!message) {
            message = "*[Maia - Suporte]*\n Alguém enviou um pedido de suporte, mas a mensagem estava vazia. Procure quem buscou atendimento para saber o que aconteceu.";
        }

        try{
            sendMessage('554499090895@s.whatsapp.net', {text: message})
            return "OK";    
        }
        catch (error) {
            console.error('Erro ao enviar mensagem de suporte:', error);
            Scout.recordFailure('support_message_error');
            return "⚠️ Desculpe, ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.";
        }
    }

    static resetAndReturnToMain(state) {
        MenuSupport.resetState(state);
        addingSupportMessage = false; //? Reseta a flag de mensagem de suporte
        return null; // Retorna null para que o MessageHandler reinicie o menu principal
    }

    static resetState(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: false,
            selectedCity: null,
            previousInput: null
        });
        addingSupportMessage = false; //? Reseta a flag de mensagem de suporte
        return null;
    }

    static getMenu() {
        return "Vamos lá! Escolha qual das opções abaixo é oque mais se encaixa com o que você precisa:\n`[caso nanhuma te ajude, escolha a opção *OUTRO*]`\n\n" + MenuSupport.formatMenu({
            title: "Menu de Suporte",
            options: {
                1: "Suporte Financeiro 💰",
                2: "Suporte de Cadastro 📝",
                3: "Outro..."
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
}

module.exports = MenuSupport;