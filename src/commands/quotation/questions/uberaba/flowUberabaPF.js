const tabelaHappyVidaPF = require('../../table/pessoafisica/tableUberaba');
const path = require('path');
const Scout = require('../../../../middlewares/scout');

class FlowUberabaPF {
    static async iniciar(state) {
        console.log("Cotação Uberaba PF, iniciada ......\n....\n..");
        // Já sabemos que é PF e Uberlândia
        state.cliente.lastQuestion = 'cobertura';
        state.currentMenu = 'cotacao_pf'; // Garante que o menu está correto
        return this.perguntarCobertura();
    }

    static async execute(userInput, state) {
        // Se não for nosso menu, retorna ao menuCotacao
        if (state.currentMenu !== 'cotacao_pf') {
            const MenuCotacao = require('../../menuCotacao');
            return MenuCotacao.execute(userInput, state);
        }

        let cliente = state.cliente;
        const lowerCaseUserInput = userInput.toLowerCase();

        // Voltar ao menu principal se digitar 'q'
        if (lowerCaseUserInput === 'q') {
            this.resetState(state);
            return null;
        }

        // Processa as respostas baseado na última pergunta feita
        switch (cliente.lastQuestion) {
            case 'cobertura':
                return this.processarCobertura(lowerCaseUserInput, state);
            case 'plano':
                return this.processarPlano(lowerCaseUserInput, state);
            case 'coparticipacao':
                return this.processarCoparticipacao(lowerCaseUserInput, state);
            case 'acomodacao':
                return this.processarAcomodacao(lowerCaseUserInput, state);
            case 'idades':
                return this.processarIdades(lowerCaseUserInput, state);
            case 'confirmar':
                return this.processarConfirmacao(lowerCaseUserInput, state);
            default:
                return "⚠️ Ocorreu um erro. Por favor, digite 'Q' para reiniciar.";
        }
    }

    static perguntarCobertura() {
        return "Qual cobertura deseja?\n\n 1 - Ambulatorial 🏥\n 2 - Completo (Ambulatorial + Hospitalar + Obstetrícia) 🏥🏨";
    }

    static processarCobertura(userInput, state) {
        const cliente = state.cliente;

        switch (userInput) {
            case '1':
                cliente.cobertura = 'Ambulatorial';
                cliente.segmentacao = 'AMB';
                cliente.acomodacao = 'S/ACOM';
                cliente.lastQuestion = 'plano';
                return "Qual plano deseja?\n\n 1 - Nosso Plano";
                
            case '2':
                cliente.cobertura = 'Completo';
                cliente.segmentacao = 'AMB+HOSP+OBST';
                cliente.lastQuestion = 'plano';
                // return "Qual plano deseja?\n\n 1 - Nosso Plano\n 2 - Nosso Médico\n 3 - Plano Odontológico 🦷";
                return "Qual plano deseja?\n\n 1 - Nosso Plano\n 2 - Nosso Médico";
                
            default:
                return "⚠️ Opção inválida. Por favor, escolha 1 para Ambulatorial ou 2 para Completo.";
        }
    }

    static processarPlano(userInput, state) {
        const cliente = state.cliente;
    
        // Se for plano odontológico
        if (userInput === '3' && cliente.cobertura === 'Completo') {
            cliente.plano = 'Plano Odontológico';
            
            const valorPlano = tabelaHappyVidaPF.Uberaba[cliente.cobertura]['Planos_Odontológicos'];
            
            this.resetState(state);
            return [
                {text: `O plano odontológico está indisponível. Caso queira, pode estar entrando contato com nosso suporte para mais informações.`},
                {text: "Seu atendimento está sendo encerrado. Você pode enviar uma mensagem para iniciar um novo atendimento.\n\n👋 Obrigado por utilizar nossos serviços!"},
            ];
            // return [
            //     {text: `💰 O valor do plano odontológico em Uberlândia, com cobertura ${cliente.cobertura.toLowerCase()}, é de R$ ${valorPlano.toFixed(2)} por pessoa/mês.`},
            //     {text: "Seu atendimento está sendo encerrado. Você pode enviar uma mensagem para iniciar um novo atendimento.\n\n👋 Obrigado por utilizar nossos serviços!"},
            // ];
        }
    
        // Processa escolha de plano normal
        if (userInput === '1') {
            cliente.plano = 'Nosso Plano';
            cliente.tipoPlano = 'Nosso Plano';
            cliente.lastQuestion = 'coparticipacao';
            return "Qual tipo de coparticipação deseja?\n\n 1 - Com Coparticipação Total\n 2 - Com Coparticipação Parcial";
        } else if (userInput === '2' && cliente.cobertura === 'Completo') {
            cliente.plano = 'Nosso Médico';
            cliente.tipoPlano = 'Nosso Médico';
            cliente.lastQuestion = 'coparticipacao';
            return "Qual tipo de coparticipação deseja?\n\n 1 - Com Coparticipação Total\n 2 - Com Coparticipação Parcial";
        } else {
            return "⚠️ Opção inválida. Por favor, escolha uma opção válida.";
        }
    }

    static processarCoparticipacao(userInput, state) {
        const cliente = state.cliente;
        
        if (userInput === '1') {
            cliente.coparticipacao = 'Total';
        } else if (userInput === '2') {
            cliente.coparticipacao = 'Parcial';
        } else {
            return "⚠️ Opção inválida. Por favor, escolha 1 para Total ou 2 para Parcial.";
        }

        //! para COMPLETO -> pergunta acomodacao
        if (cliente.cobertura === 'Completo') {
            cliente.lastQuestion = 'acomodacao';
            return "Qual tipo de acomodação deseja?\n\n 1 - Enfermaria 🏥\n 2 - Apartamento 🏨";

            //! para AMBULATORIAL -> pergunta idades
        } else if (cliente.cobertura === 'Ambulatorial') {
            cliente.lastQuestion = 'idades';
            return "Digite as idades dos beneficiários separadas por vírgula.\n\n(exemplo: 30, 45, 12):";
        } else {
            console.log('Erro L127: Cobertura inválida.');
            return "⚠️ Ocorreu um erro. Por favor, digite 'Q' para reiniciar.";
        }
    }
    
    static processarAcomodacao(userInput, state) {
        const cliente = state.cliente;
        
        if (userInput === '1') {
            cliente.acomodacao = 'ENFERM';
        } else if (userInput === '2') {
            cliente.acomodacao = 'APART';
        } else {
            return "⚠️ Opção inválida. Por favor, escolha 1 para Enfermaria ou 2 para Apartamento.";
        }
        
        cliente.lastQuestion = 'idades';
        return "Digite as idades dos beneficiários separadas por vírgula.\n\n(exemplo: 30, 45, 12):";
    }

    static processarIdades(userInput, state) {
        const cliente = state.cliente;
        
        // Remove espaços e divide por vírgulas
        const idades = userInput.split(',').map(idade => idade.trim());
        
        // Verifica se todas as entradas são números válidos
        for (const idade of idades) {
            if (isNaN(idade) || idade === '') {
                return "⚠️ Por favor, informe apenas números separados por vírgula.";
            }
        }
        
        cliente.idades = idades;
        
        try {
            // Calcula o valor da cotação
            const resultado = this.calcularCotacao(cliente);
            cliente.valorTotal = resultado.valorTotal;
            cliente.detalhamento = resultado.detalhamento;
            cliente.lastQuestion = 'confirmar';
            
            // Formata o resultado para exibição
            let mensagem = "*📊 RESULTADO DA COTAÇÃO:*\n\n";
            mensagem += `*Tipo:* Pessoa Física\n`;
            mensagem += `*Cidade:* Uberaba\n`;
            mensagem += `*Plano:* ${cliente.plano}\n`;
            mensagem += `*Cobertura:* ${cliente.cobertura}\n`;
            mensagem += `*Coparticipação:* ${cliente.coparticipacao}\n`;
            
            if (cliente.cobertura === 'Completo') {
                mensagem += `*Acomodação:* ${cliente.acomodacao === 'ENFERM' ? 'Enfermaria' : 'Apartamento'}\n`;
            }
            
            mensagem += "\n*Detalhamento por idade:*\n";
            cliente.detalhamento.forEach(item => {
                if (cliente.cobertura === 'Ambulatorial') {
                    item.valor = item.valor.toFixed(2);
                } else if (cliente.cobertura === 'Completo') {
                   mensagem += `• ${item.idade} anos: R$ ${item.valor.toFixed(2)}\n`;
                }
            });
            Scout.addQuotation();
            mensagem += `\n*VALOR TOTAL:* R$ ${cliente.valorTotal.toFixed(2)}\n\n`;
            mensagem += "✅ Deseja confirmar esta cotação? (S/N)";
            
            return [
                {text: mensagem},
                {
                    document: { url: path.resolve('./docs/pdfs/REDE DE ATENDIMENTO BH - RM HAPVIDA NDI MG.pdf') }, // Caminho para o PDF
                    mimetype: 'application/pdf',
                    fileName: `REDE DE ATENDIMENTO BH - RM HAPVIDA NDI MG`,
                    caption: `📄 *REDE DE ATENDIMENTO BH - RM HAPVIDA NDI MG*`
                }
            ];
        } catch (error) {
            Scout.recordFailure('flow_error_Uberaba_pf');
            console.error("L192: Erro ao processar idades\n", error);
            return "⚠️ Ocorreu um erro ao calcular a cotação. Por favor, tente novamente ou digite 'Q' para voltar ao menu principal.";
        }
    }

    static processarConfirmacao(userInput, state) {
        const cliente = state.cliente;
        
        if (userInput.toLowerCase() === 's') {
            console.log("Cotação concluída com sucesso!\nEncerrando cálculo de cotação para PF em Uberaba... \n\n");
            
            const mensagem = "*✅ COTAÇÃO FINALIZADA COM SUCESSO!*\n\n" +
                            `Cotação para Pessoa Física\n` +
                            `Plano ${cliente.plano} - ${cliente.cobertura}\n` +
                            `Valor Total: R$ ${cliente.valorTotal.toFixed(2)}\n\n` +
                            "Digite 'Q' para voltar ao menu principal.";
            
            return mensagem;
        } else if (userInput.toLowerCase() === 'n') {
            console.log("Cotação encerrada (não confirmada pelo usuário).\nEncerrando cálculo de cotação para PF em Uberaba... \n\n");
            this.resetState(state);
            return "Cotação cancelada.\n\nAtendimento Encerrado. Digite qualquer tecla para iniciar um novo atendimento.";
        } else {
            return "⚠️ Opção inválida. Por favor, responda com 'S' para confirmar ou 'N' para cancelar.";
        }
    }

    static calcularCotacao(cliente) {
        const detalhamento = [];
        let valorTotal = 0;

        try {
            // Obtém a tabela de preços
            const tabela = this.obterTabelaPrecos(cliente);
            
            if (!tabela) {
                throw new Error("Não foi possível obter a tabela de preços");
            }
            
            // Calcula o valor para cada idade
            for (const idadeStr of cliente.idades) {
                const idade = parseInt(idadeStr);
                let valorIdade = 0;
                
                // Determina a faixa etária e obtém o valor
                if (idade <= 18) {
                    valorIdade = tabela['0-18'];
                } else if (idade <= 23) {
                    valorIdade = tabela['19-23'];
                } else if (idade <= 28) {
                    valorIdade = tabela['24-28'];
                } else if (idade <= 33) {
                    valorIdade = tabela['29-33'];
                } else if (idade <= 38) {
                    valorIdade = tabela['34-38'];
                } else if (idade <= 43) {
                    valorIdade = tabela['39-43'];
                } else if (idade <= 48) {
                    valorIdade = tabela['44-48'];
                } else if (idade <= 53) {
                    valorIdade = tabela['49-53'];
                } else if (idade <= 58) {
                    valorIdade = tabela['54-58'];
                } else {
                    valorIdade = tabela['59+'];
                }
                
                if (cliente.cobertura === 'Completo') {
                    valorIdade += tabelaHappyVidaPF.Uberaba[cliente.cobertura]['Planos_Odontológicos']
                }

                detalhamento.push({ idade, valor: valorIdade });
                valorTotal += valorIdade;
            }
            
            return { valorTotal, detalhamento };
        } catch (error) {
            Scout.recordFailure('flow_error_Uberaba_pf');
            console.error("Erro ao calcular cotação:", error);
            return { 
                valorTotal: 0, 
                detalhamento: cliente.idades.map(idade => ({ idade, valor: 0 })) 
            };
        }
    }

    static obterTabelaPrecos(cliente) {
        try {
            let tabela;
            let basePath;
            
            // Para plano odontológico
            if (cliente.plano === 'Plano Odontológico') {
                return { valor: tabelaHappyVidaPF.Uberaba[cliente.cobertura]['Planos_Odontológicos'] };
            }
            
            // Para outros planos
            try{
                basePath = tabelaHappyVidaPF.Uberaba[cliente.cobertura];
            }catch(error){
                console.error('L288: Erro ao obter tabela de preços:', error);
                return 'Erro ao obter tabela de preços. Digite *Q* e reinicie o processo.';
            }
            if (cliente.cobertura === 'Ambulatorial') {
                tabela = basePath[cliente.plano][cliente.coparticipacao]['SACOM'];
            } else {
                // Completo tem estrutura diferente para acomodação
                const coparticipacaoPath = basePath[cliente.tipoPlano][cliente.coparticipacao];
                tabela = coparticipacaoPath[cliente.acomodacao];
            }
            
            try {
                return tabela;
            } catch (error) {
                Scout.recordFailure('flow_error_Uberaba_pf');
                console.error('L302: Erro ao obter tabela de preços:', error);
                return 'Erro ao obter tabela de preços. Reinicie o processo.';
            }
        } catch (error) {
            Scout.recordFailure('flow_error_Uberaba_pf');
            console.error('L306: Erro ao obter tabela de preços:', error);
            return null;
        }
    }

    static resetState(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: false,
            selectedCity: null,
            previousInput: null,
            cliente: null
        });
    }
}

module.exports = FlowUberabaPF;