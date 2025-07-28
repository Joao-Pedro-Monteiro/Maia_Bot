const premiacoes_Vcard = (
    'BEGIN:VCARD\n' // metadata of the contact card
    + 'VERSION:3.0\n' 
    + 'FN:Hapminas Comercial\n' // full name
    + 'ORG:Hapminas Comercial\n' // the organization of the contact
    + 'TEL;type=CELL;type=VOICE;waid=553193661077:+55 3193661077\n' // WhatsApp ID + phone number
    + 'END:VCARD'
);

class MenuPremiações {
    static async execute(userInput, state) {
        if (userInput && userInput.toLowerCase() === 'q') {
            return this.resetAndReturnToMain(state);
        }
    }

    static resetAndReturnToMain(state) {
        this.resetState(state);
        return null; // Retorna null para que o MessageHandler reinicie o menu principal
    }

    static resetState(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: true,
            selectedCity: null,
            previousInput: null
        });
        return null;
    }

    static getMenu() {
        return [
            {
                contacts: { 
                    displayName: 'Hapminas Comercial',
                    contacts: [{vcard: premiacoes_Vcard}]
                }
            },
            {
                text: `🏆 Aqui estão as premiações disponíveis:\n\n _Digite "*Q*" para voltar ao menu principal_`
            }
        ];
    }

    static formatMenu(menuData) {
        let response = `${menuData.title}\n\n`;
        Object.entries(menuData.options).forEach(([key, value]) => {
            response += `*${key}* - ${value}\n`;
        });
        return response;
    }
}

module.exports = MenuPremiações;