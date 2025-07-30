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

const WhatsAppConnection = require('../connection');
let client = new Object();
addingSupportMessage = false; //? Flag para saber se o usuário está enviando uma mensagem de suporte
client.lastQuestion = null; //? Flag para saber qual a última pergunta feita

class MenuSupport {
    static async execute(userInput, state, from) {
        if (userInput && userInput.toLowerCase() === 'q') {
            return MenuSupport.resetAndReturnToMain(state);
        }

        if (userInput && state.currentMenu === 'support' && addingSupportMessage === false) {
            switch(parseInt(userInput)) {
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
                            text: `💼 Aqui está o contato para suporte comercial.\nEntre em contato e ele te atenderá assim que possível.`
                        },
                        {text: '_Seu atendimento foi encerrado_.\nAté logo! 👋'}
                    ];

                case 2:
                    MenuSupport.resetState(state)
                    return [
                        {
                            contacts: { 
                                displayName: 'João Pedro Monteiro',
                                contacts: [{vcard: teacher_Vcard}]
                            }
                        },
                        {
                            text: '🪪 Aqui está o contato para suporte de cadastros.\nEntre em contato e ele te atenderá assim que possível.'
                        },
                        {text: '_Seu atendimento foi encerrado_.\nAté logo! 👋'}
                    ];

                case 3:
                    client.lastQuestion = 'fullName'; //? Define que a última pergunta foi o nome completo'
                    addingSupportMessage = true; //? Ativa a flag de mensagem de suporte
                    return "Antes, de anotar seu pedido de suporte, preciso saber seu nome completo.";

                default:
                    return "⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n" + MenuSupport.getMenu();
            }

        } else if (userInput && state.currentMenu === 'support' && addingSupportMessage) {
            //! SE O USUÁRIO DESEJA ENVIAR UMA MENSAGEM AO SUPORTE...
            switch (client.lastQuestion) {
                case 'fullName':
                    client.fullName = userInput.trim();
                    client.lastQuestion = 'message'; //? Define que a próxima pergunta será a mensagem

                    return "📝 Me diga qual problema você está enfrentando e enviarei para o responsável. Mais tarde ele entrará em contato para te ajudar.";
                    
                case 'message':
                    let response = MenuSupport.addSupportMessage(userInput, client.fullName);
                    if (response === "OK") {
                        MenuSupport.resetAndReturnToMain(state)
                        return[
                            {text: '✅ Sua mensagem foi enviada com sucesso! O responsável entrará em contato em breve.'},
                            {text: '_Seu atendimento foi encerrado_.\nAté logo! 👋'}

                        ]
                    }else{
                        MenuSupport.resetAndReturnToMain(state)
                        return response
                    }

                default:
                    return "⚠️ Opção inválida. digite 'q' para voltar ao menu principal.";
            }
        }
        
        //! Se chegou até aqui, exibe o menu principal de suporte
        state.currentMenu = 'suporte';
        return MenuSupport.getMenu();
    }

    static sendMessage(to, item) {
        try {
            const sock = WhatsAppConnection.getSocket();
            if (!sock) throw new Error("Socket ainda não foi inicializado.");

            sock.sendMessage(to, item);
        } catch (err) {
            console.error("Erro ao tentar enviar mensagem via bot:", err);
        }
    }

    static addSupportMessage(userInput, userName) {
        const message = userInput.trim();

        let supportMessage = `*📨 Nova solicitação de suporte* \n\n*De:* _${userName}_\n\n*Mensagem:* _${message}_`;


        if (!message) {
            supportMessage = `*📨 Nova solicitação de suporte* \n\nRecebi um pedido de suporte de: *${userName}* ,mas a mensagem estava vazia. \nProcure-o(a) para saber o que aconteceu.`;
        }
        // Tenta enviar a mensagem
        try{
            setTimeout(()=>{
                MenuSupport.sendMessage('554499090895@s.whatsapp.net', {text: supportMessage})
            }, 1000); //* Aguarda 1 segundo antes de enviar a mensagem
            
            return "OK";  
        }
        catch (error) {
            console.error('Erro ao enviar mensagem de suporte:', error);
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
        return "Vamos lá! Escolha qual das opções abaixo é oque mais se encaixa com o que você precisa:\n\n" + MenuSupport.formatMenu({
            title: "*⚙️ Menu de Suporte*",
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