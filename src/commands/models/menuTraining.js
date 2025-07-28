const path = require('path');

class MenuTreinamento {
    
    static async execute(userInput, state) {
        if (userInput.toLowerCase() === 'q') {
            return this.resetAndReturnToMain(state);
        }

        if (!userInput) {
            return this.getMenu();
        }

        const option = parseInt(userInput);

        if (!isNaN(option)){
            switch (option){
                case 1:
                    console.log('menuTreinamento -> Treinamento selecionado: 1');
                    return {
                        image: { url: path.resolve('./docs/images/Hapminas.jpeg') },
                        caption: (`💼 *_INFORMAÇÕES DO TREINAMENTO:_*\n\n  *Nome:* Treinamento 1\n  *Descrição:* Descrição do Treinamento 1\n  *Data:* 01/05/2025\n  *Horário:* 10:00\n  *Local:* Local do Treinamento 1\n  *Instrutores:* Instrutor 1, Instrutor 2\n  *Participantes:* Participante 1, Participante 2\n  *Valor:* R$ 100,00\n  *Increva-se:* www.example.com/treinamento1\n\n _Digite *Q* para voltar ao menu inicial._`)
                    }
                    
                default:
                    console.log('menuTreinamento -> Opção inválida. Por favor, escolha uma opção válida.');
                    return "⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n" + this.getMenu();
            }
            
        } else {
            return "⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n" + this.getMenu();
        }
    }

    static resetAndReturnToMain(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: false,
            selectedCity: null,
            previousInput: null
        });
        return null;
    }

    static resetState(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: true,
            selectedCity: null,
            previousInput: null
        });
    }

    static getMenu() {
        console.log("menuTreinamento -> Iniciando atendimento no menu de treinamentos...");
        return this.formatMenu({
            title: "📚 *Menu de Treinamentos*",
            options: {
                '1': "Treinamento 1",
                'Q': "Voltar ao menu principal ⬅"
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

    static formatTrainingInfo(training) {
        return `📝 *Descrição:* ${training.description}\n🔗 *Acesse aqui:* ${training.link}\n\n'`;
    }
}

module.exports = MenuTreinamento;