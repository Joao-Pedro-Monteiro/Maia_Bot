const path = require('path');

class MenuTabelas {
    static async execute(userInput, state) {
        if (userInput && userInput.toLowerCase() === 'q') {
            console.log("menuTabelas -> Retornando ao menu principal...");
            return this.resetAndReturnToMain(state);
        }

        if (state.currentMenu === 'tabelas' && userInput) {
            return this.processUserChoice(userInput, state);
        }
        
        return this.getMenu();
    }

    static processUserChoice(userInput, state) {
        const option = parseInt(userInput);
        
        switch(option) {
            case 1:
                this.resetState(state)
                state.hasShownWelcome = false;
                return [
                    this.getPdfDocument("PME/PME BELO HORIZONTE 30 A 99 VIDAS.pdf", "Tabela:\n *_PME Belo Horizonte - 30 a 99 pessoas._*"),
                    this.getPdfDocument("PME/SUPER SIMPLES BH 2 A 29 VIDAS.pdf", "Tabela:\n *_SUPER SIMPLES Belo Horizonte - 2 a 29 pessoas._*"),
                    this.getPdfDocument("PF/AMBULATORIAL BELO HORIZONTE.pdf", "Tabela:\n *_AMBULATORIAL Belo Horizonte_*"),
                    this.getPdfDocument("PF/INDIVIDUAL COMPLETO BELO HORIZONTE.pdf", "Tabela:\n *_INDIVIDUAL COMPLETO Belo Horizonte_*"),
                    {text: '_Atendimento Encerrado_ \n👋 Obrigado por usar nossos serviços. Até logo!'}
                ];
                
            case 2:
                this.resetState(state)
                state.hasShownWelcome = false;
                return [
                    this.getPdfDocument("PME/PME TRIANGULO MINEIRO 30 A 99 VIDAS.pdf", "Tabela:\n *_PME Triângulo Mineiro - 30 a 99 pessoas._*"),
                    this.getPdfDocument("PME/SUPER SIMPLES TRIANGULO MINEIRO 2 A 29 VIDAS.pdf", "Tabela:\n *_SUPER SIMPLES Triângulo Mineiro- 2 a 29 pessoas._*"),
                    this.getPdfDocument("PF/AMBULATORIAL UBERABA E UBERLANDIA.pdf", "Tabela:\n *_AMBULATORIAL Uberaba e Uberlandia_*"),
                    this.getPdfDocument("PF/INDIVIDUAL COMPLETO UBERABA E UBERLANDIA.pdf", "Tabela:\n *_INDIVIDUAL COMPLETO Uberaba e Uberlandia_*"),
                    {text: '_Atendimento Encerrado_ \n👋 Obrigado por usar nossos serviços. Até logo!'}
                ];
                
            default:
                return "⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n" + this.getMenu();
        }
    }

    static getPdfDocument(filename, title) {
        return {
            document: { url: path.resolve(`./DOCS/pdfs/${filename}`) },
            mimetype: 'application/pdf',
            fileName: filename,
            caption: `📄 ${title}`
        };
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

    static resetAndReturnToMain(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: false,
            selectedCity: null,
            hasSeenTable: false
        });
        
        return null;
    }

    static getMenu() {
        return this.formatMenu({
            title: "📊 Menu de Tabelas",
            options: {
                1: "Belo Horizonte",
                2: "Triângulo Mineiro",
                'Q': "Voltar ao menu principal"
            }
        }) + "\n\nDigite o número da tabela que deseja visualizar:";
    }

    static formatMenu(menuData) {
        let response = `${menuData.title}\n\n`;
        Object.entries(menuData.options).forEach(([key, value]) => {
            response += `${key} - ${value}\n`;
        });
        return response;
    }
}

module.exports = MenuTabelas;