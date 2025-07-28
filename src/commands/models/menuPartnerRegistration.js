const { text } = require("express");

const suport_Vcard = (
    'BEGIN:VCARD\n'
    + 'VERSION:3.0\n' 
    + 'FN:Hapminas Comercial\n'
    + 'ORG:Hapminas Comercial\n'
    + 'TEL;type=CELL;type=VOICE;waid=553193661077:+55 3193661077\n'
    + 'END:VCARD'
);

parceiro = new Object();
class MenuParceiro {
    static async execute(userInput, state) {
        const lowerCaseUserInput = userInput.toLowerCase();

        if (state.currentMenu === 'parceiro' && parceiro.etapaAnterior) {
            switch (parceiro.etapaAnterior) {
                case 'nome':
                    parceiro.nome = userInput;
                    parceiro.etapaAnterior = 'cpf';
                    return "💼 *_INFORME:_*\n\n CPF";

                case 'cpf':
                    parceiro.cpf = userInput;
                    parceiro.etapaAnterior = 'telefone';
                    return "💼 *_INFORME:_*\n\n Telefone: ";

                case 'telefone':
                    if(userInput.replace(/[^0-9]/g, '').length != 11){
                        return "⚠️ *Telefone inválido!*\n\n *_INFORME:_*\n\n Telefone:";
                    } else {
                        parceiro.telefone = userInput;
                        parceiro.etapaAnterior = 'endereco';
                        return "💼 *_INFORME:_*\n\n Endereço:";
                    }

                case 'endereco':
                    parceiro.endereco = userInput;
                    parceiro.etapaAnterior = 'finish';
                    return ("💼 *_INFORMADO:_*\n\n  *Nome:* " + parceiro.nome + "\n  *CPF*: " + parceiro.cpf + "\n  *Telefone:* " + parceiro.telefone + "\n  *Endereço:* " + parceiro.endereco + `\n\n *_Deseja Salvar as informações?_ [s/n]*`);

                case 'finish':
                    if (lowerCaseUserInput === 's') {
                        this.resetState(state);
                        return [
                            {
                                contacts: { 
                                    displayName: 'Hapminas Comercial',
                                    contacts: [{vcard: suport_Vcard}]
                                }
                            },
                            {
                                text: "✅ *Cadastrado com sucesso no sistema!*\n\n💼 Aqui está o contato do nosso suporte.\nLigue para nós ou envie uma mensagem!"
                            },
                            {
                                text: "_Atendimento Encerrado_\n👋 Obrigado por usar nossos serviços. Até logo!"
                            }
                        ];
                    } else if (lowerCaseUserInput === 'n') {
                        this.resetState(state);
                        return null;
                    } else {
                        return "⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n" + this.getMenu();
                    }
            }
        }

        if (state.currentMenu === 'parceiro') {
            switch (lowerCaseUserInput) {
                case 's':
                    parceiro. etapaAnterior = 'nome';
                    return "💼 *_INFORME:_*\n\n Nome Completo";
                case 'n':
                    this.resetState(state);
                    return null
                default:
                    return "⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n" + this.getMenu();
            }
        }
    }
    
    static resetState(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: true, // Mantém como true para evitar dupla mensagem
            selectedCity: null,
            previousInput: null
        });
    }

    static getMenu() {
        return "Deseja se cadastrar um parceiro produtor? [s/n]: ";
    }
}
module.exports = MenuParceiro;