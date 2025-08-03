const path = require('path');
const Scout = require('../middlewares/scout.js');

const MENU_MODULES = { 
    //* 0: {path: './modulePath', name: 'name os current menu' },
    1: { path: './payment/menuPayments', name: 'payments' },
    2: { path: './menuTimeline', name: 'timeline' },
    3: { path: './menuSupport', name: 'support' },
    8068: { path: '../middlewares/scout.js', name: 'scout' },
};

class Menu {
    static async execute(userInput, state) {
        if (userInput.from && userInput.from.endsWith('@g.us')) {
            return;
        }
        if (state.from && state.from.endsWith('@g.us')) {
            return;
        }
        
        if (!state.hasShownWelcome) {
            state.hasShownWelcome = true;
            return {
                image: { url: path.resolve('./docs/images/Logo.png') },
                caption: "Oi, sou a Maia, assistente virtual Nimbus ☁️💜\n\n" + this.getMainMenu()
            };
        }

        if (state.currentMenu !== 'main' && userInput.toLowerCase() === 'q') {
            this.resetState(state);
            return {
                image: { url: path.resolve('./docs/images/Logo.png') },
                caption: "Oi, sou a Maia, assistente virtual Nimbus ☁️💜\n\n" + this.getMainMenu()
            };
        }

        if (state.currentMenu !== 'main') {
            try {
                const currentModule = Object.values(MENU_MODULES).find(m => 
                    state.currentMenu.startsWith(m.name)
                );

                if (currentModule) {
                    const menuModule = require(currentModule.path);
                    const response = await menuModule.execute(userInput, state);
                    
                    if (response === null) {
                        this.resetState(state);
                        
                        return {
                            image: { url: path.resolve('./docs/images/Logo.png') },
                            caption: "Oi, sou a Maia, assistente virtual Nimbus ☁️💜\n\n" + this.getMainMenu()
                        };
                    }
                    return response;
                }
            } catch (error) {
                Scout.recordFailure('error_in_menu_module');
                console.error('Erro ao executar módulo:', error);
                return "⚠️ Desculpe, ocorreu um erro ao processar sua solicitação. Digite `Q` para voltar ao início. \n *Erro [menu_57-59]*";
            }
        }

        return this.handleMainMenu(userInput, state);
    }

    static resetState(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: true,
            selectedCity: null,
            previousInput: null
        });
    }

    static handleMainMenu(userInput, state) {
        const option = parseInt(userInput);

        if (isNaN(option) || option < 1) {
            return "⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n" + this.getMainMenu();
        }

        if (option === 4) {
            this.resetState(state);
            state.hasShownWelcome = false;
            return "👋 Obrigado por usar nossos serviços. Até logo!";
        }

        const menuModule = MENU_MODULES[option];
        if (menuModule) {
            try {
                const module = require(menuModule.path);
                state.currentMenu = menuModule.name;
                return module.getMenu(state);
            } catch (error) {
                Scout.recordFailure('error_in_menu_module');
                console.error('Erro ao carregar módulo:', error);
                return "⚠️ Desculpe, esta opção não está indisponível ainda.";
            }
        }

        return "Esta funcionalidade será implementada em breve.";
    }

    static getMainMenu() {
        return this.formatMenu({
            title: "Posso te ajudar nas seguintes opções:\n\n_Você pode digitar `Q` a qualquer momento para voltar a este menu!_",
            options: {
                1: "*Pagamento de mensalidades 🏦*",
                2: "*Cronograma de um curso 📅*",
                3: "*Pedido de suporte 📞*",
                4: "*_SAIR_*"
            }
        });
    }

    static formatMenu(menuData) {
        let response = `${menuData.title}\n\n`;
        Object.entries(menuData.options).forEach(([key, value]) => {
            response += `${key} - ${value}\n`;
        });
        return response;
    }
}

module.exports = Menu;