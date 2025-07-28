class MenuCotacao {
    static async execute(userInput, state) {
        // Inicializa o objeto de cliente no estado se não existir
        if (!state.cliente) {
            state.cliente = {};
        }
        let cliente = state.cliente;
        const lowerCaseUserInput = userInput.toLowerCase();

        //* Se já temos um fluxo específico em andamento, redireciona para ele
        switch (cliente.cidade) {
            case 'Belo Horizonte':
                if (state.currentMenu === 'cotacao_pf') {
                    const FlowBeloHorizontePF = require('./questions/beloHorizonte/flowBeloHorizontePF');
                    return FlowBeloHorizontePF.execute(userInput, state);
                } else if (state.currentMenu === 'cotacao_pj') {
                    const FlowBeloHorizontePJ = require('./questions/beloHorizonte/flowBeloHorizontePJ');
                    return FlowBeloHorizontePJ.execute(userInput, state);
                }

            case 'Uberlandia':
                if (state.currentMenu === 'cotacao_pf') {
                    const FlowUberlandiaPF = require('./questions/uberlandia/flowUberlandiaPF');
                    return FlowUberlandiaPF.execute(userInput, state);
                } else if (state.currentMenu === 'cotacao_pj') {
                    const FlowUberlandiaPJ = require('./questions/uberlandia/flowUberlandiaPJ');
                    return FlowUberlandiaPJ.execute(userInput, state);
                }
            case 'Uberaba':
            if (state.currentMenu === 'cotacao_pf') {
                const FlowUberabaPF = require('./questions/uberaba/flowUberabaPF');
                return FlowUberabaPF.execute(userInput, state);
            } else if (state.currentMenu === 'cotacao_pj') {
                const FlowUberabaPJ = require('./questions/uberaba/flowUberabaPJ');
                return FlowUberabaPJ.execute(userInput, state);
            }

            default:
                //* Caso contrário, continua com o fluxo padrão
                break;
        }

        // Voltar ao menu principal se digitar 'q'
        if (lowerCaseUserInput === 'q') {
            this.resetState(state);
            return null;
        }

        // Se for primeira interação, exibe menu principal de cotação
        if (!cliente.lastQuestion) {
            cliente.lastQuestion = 'peopleType';
            return this.getMenu(state);
        }

        // Processa as respostas baseado na última pergunta feita
        switch (cliente.lastQuestion) {
            case 'peopleType':
                return this.processarTipoPessoa(userInput, state);
            case 'cidade':
                return this.processarCidade(lowerCaseUserInput, state);
            default:
                return "⚠️ Ocorreu um erro. Por favor, digite 'Q' para reiniciar.";
        }
    }

    // Processa o tipo de pessoa
    static processarTipoPessoa(userInput, state) {
        const cliente = state.cliente;
        
        switch (userInput) {
            case '1':
                cliente.peopleType = 'PF';
                cliente.lastQuestion = 'cidade';
                return this.perguntarCidade();
            case '2':
                cliente.peopleType = 'PJ';
                cliente.lastQuestion = 'cidade';
                return this.perguntarCidade();
            default:
                return "⚠️ Opção inválida. Por favor, escolha 1 para Pessoa Física ou 2 para Pessoa Jurídica.";
        }
    }

    // Pergunta a cidade
    static perguntarCidade() {
        return "🏙️ Para qual cidade deseja a cotação?\n\n" +
               " 1 - Belo Horizonte\n" +
               " 2 - Uberlândia\n" +
               " 3 - Uberaba\n\n" +
               "Digite o número da sua escolha:";
    }

    // Processa a escolha da cidade
    static processarCidade(userInput, state) {
        const cliente = state.cliente;

        switch (userInput) {
            case '1':
                cliente.cidade = 'Belo Horizonte';
                // Redireciona para o fluxo apropriado
                if (cliente.peopleType === 'PF') {
                    // Altera o menu atual para cotacao_pf para manter o fluxo
                    state.currentMenu = 'cotacao_pf';
                    // Importa e executa o fluxo de Belo Horizonte PF
                    const FlowBeloHorizontePF = require('./questions/beloHorizonte/flowBeloHorizontePF');
                    return FlowBeloHorizontePF.iniciar(state);
                } else if (cliente.peopleType === 'PJ') {
                    // Altera o menu atual para cotacao_pj para manter o fluxo
                    state.currentMenu = 'cotacao_pj';
                    // Importa e executa o fluxo de Belo Horizonte PJ
                    const FlowBeloHorizontePJ = require('./questions/beloHorizonte/flowBeloHorizontePJ');
                    return FlowBeloHorizontePJ.iniciar(state);
                }
                break;
                
            case '2':
                cliente.cidade = 'Uberlandia';
                // Redireciona para o fluxo apropriado
                if (cliente.peopleType === 'PF') {
                    // Altera o menu atual para cotacao_pf para manter o fluxo
                    state.currentMenu = 'cotacao_pf';
                    // Importa e executa o fluxo de Belo Horizonte PF
                    const FlowUberlandiaPF = require('./questions/uberlandia/flowUberlandiaPF');
                    return FlowUberlandiaPF.iniciar(state);
                } else if (cliente.peopleType === 'PJ') {
                    // Altera o menu atual para cotacao_pj para manter o fluxo
                    state.currentMenu = 'cotacao_pj';
                    // Importa e executa o fluxo de Belo Horizonte PJ
                    const FlowUberlandiaPJ = require('./questions/uberlandia/flowUberlandiaPJ');
                    return FlowUberlandiaPJ.iniciar(state);
                }
                break;
            case '3':
                cliente.cidade = 'Uberaba';
                // Redireciona para o fluxo apropriado
                if (cliente.peopleType === 'PF') {
                    // Altera o menu atual para cotacao_pf para manter o fluxo
                    state.currentMenu = 'cotacao_pf';
                    // Importa e executa o fluxo de Belo Horizonte PF
                    const FlowUberabaPF = require('./questions/uberaba/flowUberabaPF');
                    return FlowUberabaPF.iniciar(state);
                } else if (cliente.peopleType === 'PJ') {
                    // Altera o menu atual para cotacao_pj para manter o fluxo
                    state.currentMenu = 'cotacao_pj';
                    // Importa e executa o fluxo de Belo Horizonte PJ
                    const FlowUberabaPJ = require('./questions/uberaba/flowUberabaPJ');
                    return FlowUberabaPJ.iniciar(state);
                }
                break;
                       
            default:
                return "⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n" + this.perguntarCidade();
        }
    }

    // Reset do estado para voltar ao menu principal
    static resetState(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: true,
            selectedCity: null,
            previousInput: null,
            cliente: {}
        });
    }

    // Menu inicial de cotação
    static getMenu(state) {
        // Garante que estamos no menu de cotação
        state.currentMenu = 'cotacao';
        state.cliente = {}; // Reinicia o objeto cliente
        state.cliente.lastQuestion = "peopleType";
        
        return "📈 *_Iniciando Cotação_*\n\n" +
               "_Digite *'Q'* a qualquer momento para voltar ao menu principal_\n\n" +
               "Para qual tipo de pessoa deseja a cotação?\n\n" +
               " 1 - Pessoa Física (PF) 👤\n" +
               " 2 - Pessoa Jurídica (PJ/PME) 🏢\n\n" +
               "Digite o número da sua escolha:";
    }
}

module.exports = MenuCotacao;