//Importa a tabela de preços:
const tabelaHappyVidaPJ = require('../../table/pessoajuridica/tableUberlandia');
const sct = require('../../../../middlewares/scout');
const path = require('path');


class FlowUberlandiaPJ {
    static async iniciar(state) {
        console.log("Cotação Uberlândia PJ, iniciada ......\n....\n..");
        // Já sabemos que é PJ e Uberlândia
        state.cliente.lastQuestion = 'qtdBeneficiario';
        state.currentMenu = 'cotacao_pj'; // Garante que o menu está correto
        return this.perguntarQuantidadeBeneficiarios();
    }

    static async execute(userInput, state) {
        // Se não for nosso menu, retorna ao menuCotacao
        if (state.currentMenu !== 'cotacao_pj') {
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
            case 'qtdBeneficiario':
                return this.processarQuantidadeBeneficiarios(lowerCaseUserInput, state);
            case 'tipoPlano':
                return this.processarTipoPlano(lowerCaseUserInput, state);
            case 'coparticipacao':
                return this.processarCoparticipacao(lowerCaseUserInput, state);
            case 'segmentacao':
                return this.processarSegmentacao(lowerCaseUserInput, state);
            case 'acomodacao':
                return this.processarAcomodacao(lowerCaseUserInput, state);
            case 'assistencia':
                return this.processarAssistencia(lowerCaseUserInput, state);
            case 'idades':
                return this.processarIdades(lowerCaseUserInput, state);
            case 'confirmar':
                return this.processarConfirmacao(lowerCaseUserInput, state);
            default:
                console.log('ERRO:\n    Pergunta não reconhecida:', cliente.lastQuestion, "\n   Resposta:", userInput);
                return "⚠️ Ocorreu um erro. Por favor, digite 'Q' para reiniciar.";
        }
    }
    

    //* FUNÇÕES DE ENVIO DE MENSAGENS E PROCESSAMENTO DE RESPOSTAS

    static perguntarQuantidadeBeneficiarios() {
        return "👥 Qual a quantidade de beneficiários?\n\n" +
               " 1 - De 2 a 29 pessoas\n" +
               " 2 - De 30 a 99 pessoas\n\n" +
               "Digite o número da sua escolha:";
    }

    static processarQuantidadeBeneficiarios(userInput, state) {
        const cliente = state.cliente;

        switch (userInput) {
            case '1':
                cliente.qtdBeneficiario = '2-29';
                cliente.lastQuestion = 'tipoPlano';
                return "Qual plano deseja contratar?\n\n 1 - Nosso Plano\n 2 - Nosso Médico";
            case '2':
                cliente.qtdBeneficiario = '30-99';
                cliente.lastQuestion = 'tipoPlano';
                return "Qual plano deseja contratar?\n\n 1 - Nosso Plano\n 2 - Nosso Médico";
            default:
                return "⚠️ Opção inválida. Por favor, escolha 1 para 2-29 pessoas ou 2 para 30-99 pessoas.";
        }
    }

    static processarTipoPlano(userInput, state) {
        const cliente = state.cliente;

        switch (userInput) {
            case '1':
                cliente.tipoPlano = 'Nosso Plano';
                cliente.lastQuestion = 'coparticipacao';
                return "Qual tipo de coparticipação?\n\n 1 - Com Coparticipação Total\n 2 - Com Coparticipação Parcial";
            case '2':
                cliente.tipoPlano = 'Nosso Médico';
                cliente.lastQuestion = 'coparticipacao';
                return "Qual tipo de coparticipação?\n\n 1 - Com Coparticipação Total\n 2 - Com Coparticipação Parcial";
            default:
                return "⚠️ Opção inválida. Por favor, escolha 1 para Nosso Plano ou 2 para Nosso Médico.";
        }
    }

    static processarCoparticipacao(userInput, state) {
        const cliente = state.cliente;

        switch (userInput) {
            case '1':
                cliente.coparticipacao = 'Total';
                cliente.lastQuestion = 'segmentacao';
                return this.perguntarSegmentacao(cliente);
            case '2':
                cliente.coparticipacao = 'Parcial';
                cliente.lastQuestion = 'segmentacao';
                return this.perguntarSegmentacao(cliente);
            default:
                return "⚠️ Opção inválida. Por favor, escolha 1 para Coparticipação Total ou 2 para Coparticipação Parcial.";
        }
    }

    static perguntarSegmentacao(cliente) {
        if (cliente.tipoPlano === 'Nosso Médico') { //? SEGMENTAÇÃO 'NOSSO MÉDICO'
            // Nosso médico só tem AMB+HOSP+OBST, segue para a pergunta acomodação
            cliente.segmentacao = 'AMB+HOSP+OBST';
            cliente.lastQuestion = 'acomodacao';
            return "Qual tipo de acomodação deseja?\n\n" + 
                    " 1 - Enfermaria\n" + 
                    " 2 - Apartamento";

        } else if (cliente.tipoPlano === 'Nosso Plano') { //? SEGMENTAÇÃO 'NOSSO PLANO'
            // Nosso plano tem 2 segmentaçõe (iguais tanto para 2-29 vidas como para 30-99 vidas) AMB e AMB+HOSP+OBST
            return "Qual segmentação deseja?\n\n" +
                        " 1 - AMB (Ambulatorial)\n" +
                        " 2 - AMB+HOSP+OBST (Ambulatorial + Hospitalar + Obstetrícia)";

        }else {
            console.log("L140: Erro no tipo de plano.");
            return "⚠️ Ocorreu um erro. Por favor, digite 'Q' para reiniciar.";
        }
    }

    static processarSegmentacao(userInput, state) {
        const cliente = state.cliente;

        if (cliente.tipoPlano === 'Nosso Plano') {
            switch (userInput) {
                case '1':
                    cliente.segmentacao = 'AMB';
                    cliente.acomodacao = 'S/ACOM';
                    
                    // Para 30-99 com AMB, precisa perguntar assistência médica
                    if (cliente.qtdBeneficiario === '30-99') {
                        cliente.lastQuestion = 'assistencia';
                        return "Qual assistência médica deseja?\n\n" +
                                " 1 - Médico 1\n" +
                                " 2 - Médico 2";
                    } else {
                        cliente.lastQuestion = 'idades';
                        return this.obterMensagemIdades(cliente);
                    }
                    
                case '2':
                    cliente.segmentacao = 'AMB+HOSP+OBST';
                    cliente.lastQuestion = 'acomodacao';
                    return "Qual tipo de acomodação deseja?\n\n" + 
                            " 1 - Enfermaria\n" +
                            " 2 - Apartamento";
                    
                default:
                    return "⚠️ Opção inválida. Por favor, escolha 1 para AMB ou 2 para AMB+HOSP+OBST.";
            }
        }
    }

    static processarAcomodacao(userInput, state) {
        const cliente = state.cliente;

        switch (userInput) {
            case '1':
                cliente.acomodacao = 'ENFERM';
                break;
            case '2':
                cliente.acomodacao = 'APART';
                break;
            default:
                return "⚠️ Opção inválida. Por favor, escolha 1 para Enfermaria ou 2 para Apartamento.";
        }
        
        // Para 30-99 vidas, sempre pergunta assistência após acomodação
        if (cliente.qtdBeneficiario === '30-99') {
            cliente.lastQuestion = 'assistencia';
            return "Qual assistência médica deseja?\n\n 1 - Médico 1\n 2 - Médico 2";
        } else {
            cliente.lastQuestion = 'idades';
            return this.obterMensagemIdades(cliente);
        }
    }

    static processarAssistencia(userInput, state) {
        const cliente = state.cliente;
        
        switch (userInput) {
            case '1':
                cliente.assistencia = 'medico 1';
                cliente.lastQuestion = 'idades';
                return this.obterMensagemIdades(cliente);
            case '2':
                cliente.assistencia = 'medico 2';
                cliente.lastQuestion = 'idades';
                return this.obterMensagemIdades(cliente);
            default:
                return "⚠️ Opção inválida. Por favor, escolha 1 para Médico 1 ou 2 para Médico 2.";
        }
    }

    static obterMensagemIdades(cliente) {
        if (cliente.qtdBeneficiario === '2-29') {
            return "👥 Informe as idades dos beneficiários separando por vírgula.\n\n" +
                   "⚠️ *IMPORTANTE:* Mínimo de 2 idades, máximo de 29.\n" +
                   "(exemplo: 18, 25, 30):";
        } else {
            return "👥 Informe as idades dos beneficiários separando por vírgula.\n\n" +
                   "⚠️ *IMPORTANTE:* Mínimo de 30 idades, máximo de 99.\n" +
                   "(exemplo: 20, 25, 28, 30... até completar no mínimo 30 idades):";
        }
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

        // Validação de quantidade mínima e máxima de idades
        if (cliente.qtdBeneficiario === '2-29') {
            if (idades.length < 2) {
                return "⚠️ *ERRO: Quantidade insuficiente de idades!*\n\n" +
                       `Você selecionou o plano para 2-29 pessoas, mas informou apenas ${idades.length} idade(s).\n\n` +
                       "Por favor, informe pelo menos 2 idades para continuar a cotação.";
            }
            if (idades.length > 29) {
                return "⚠️ *ERRO: Quantidade excessiva de idades!*\n\n" +
                       `Você selecionou o plano para 2-29 pessoas, mas informou ${idades.length} idades.\n\n` +
                       "Por favor, informe no máximo 29 idades para este plano.";
            }
        } else if (cliente.qtdBeneficiario === '30-99') {
            if (idades.length < 30) {
                return "⚠️ *ERRO: Quantidade insuficiente de idades!*\n\n" +
                       `Você selecionou o plano para 30-99 pessoas, mas informou apenas ${idades.length} idade(s).\n\n` +
                       "Por favor, informe pelo menos 30 idades para continuar a cotação.";
            }
            if (idades.length > 99) {
                return "⚠️ *ERRO: Quantidade excessiva de idades!*\n\n" +
                       `Você selecionou o plano para 30-99 pessoas, mas informou ${idades.length} idades.\n\n` +
                       "Por favor, informe no máximo 99 idades para este plano.";
            }
        }

        cliente.idades = idades;

        try {
            // Calcula o valor da cotação
            const resultado = this.calcularCotacao(cliente);
            
            // Verifica se o resultado é válido
            if (!resultado || !resultado.valorTotal) {
                throw new Error("Resultado inválido ou falha no cálculo");
            }
            
            cliente.valorTotal = resultado.valorTotal;
            cliente.detalhamento = resultado.detalhamento;
            cliente.lastQuestion = 'confirmar';

            // Formata o resultado para exibição
            let mensagem = "*📊 RESULTADO DA COTAÇÃO:*\n\n";
            mensagem += `*Tipo:* Pessoa Jurídica\n`;
            mensagem += `*Cidade:* Uberlândia\n`;  // Corrigido para Uberlândia
            mensagem += `*Quantidade:* ${cliente.qtdBeneficiario} pessoas\n`;
            mensagem += `*Plano:* ${cliente.tipoPlano}\n`;
            mensagem += `*Coparticipação:* ${cliente.coparticipacao}\n`;
            mensagem += `*Segmentação:* ${cliente.segmentacao}\n`;
            
            if (cliente.assistencia) {
                mensagem += `*Assistência Médica:* ${cliente.assistencia === 'medico 1' ? 'Médico 1' : 'Médico 2'}\n`;
            }
            
            mensagem += `*Acomodação:* ${cliente.acomodacao}\n\n`;

            mensagem += "*Detalhamento por idade:*\n";
            cliente.detalhamento.forEach(item => {
                mensagem += `• ${item.idade} anos: R$ ${item.valor.toFixed(2)}\n`;
            });
            sct.addQuotation();
            mensagem += `\n*VALOR TOTAL:* R$ ${cliente.valorTotal.toFixed(2)}\n\n`;
            mensagem += "✅ Deseja confirmar esta cotação? (S/N)";

            return mensagem;
        } catch (error) {
            Scout.recordFailure('flow_error_Uberlandia_pj');
            console.error("Erro ao processar idades:", error);
            return "⚠️ Ocorreu um erro ao calcular a cotação. Por favor, tente novamente ou digite 'Q' para voltar ao menu principal.";
        }
    }

    static processarConfirmacao(userInput, state) {
        const cliente = state.cliente;

        if (userInput.toLowerCase() === 's') {
            console.log("Cotação concluída com sucesso!\nEncerrando cálculo de cotação para PJ em Uberlândia... \n\n");

            const mensagem = "*✅ COTAÇÃO FINALIZADA COM SUCESSO!*\n\n" +
                `Cotação para Pessoa Jurídica\n` +
                `Plano ${cliente.tipoPlano} - ${cliente.segmentacao}\n` +
                `Valor Total: R$ ${cliente.valorTotal.toFixed(2)}\n\n` +
                "Digite 'Q' para voltar ao menu principal.";

            return [
                {text: mensagem},
                {
                    document: { url: path.resolve('./docs/pdfs/REDE DE ATENDIMENTO BH - RM HAPVIDA NDI MG.pdf') }, // Caminho para o PDF
                    mimetype: 'application/pdf',
                    fileName: `REDE DE ATENDIMENTO BH - RM HAPVIDA NDI MG`,
                    caption: `📄 *REDE DE ATENDIMENTO BH - RM HAPVIDA NDI MG*`
                }
            ];
        } else if (userInput.toLowerCase() === 'n') {
            console.log("Cotação encerrada (não confirmada pelo usuário).\nEncerrando cálculo de cotação para PJ em Uberlândia... \n\n");
            this.resetState(state); // Reseta o estado do cliente
            return "Cotação cancelada.\n\nAtendimento Encerrado. Digite qualquer tecla para iniciar um novo atendimento.";
        } else {
            return "⚠️ Opção inválida. Por favor, responda com 'S' para confirmar ou 'N' para cancelar.";
        }
    }

    static calcularCotacao(cliente) {
        const detalhamento = [];
        let valorTotal = 0;

        try {
            // Determina a tabela de preços
            const tabela = this.obterTabelaPrecos(cliente);

            if (!tabela) {
                throw new Error("Não foi possível obter a tabela de preços");
            }

            // Calcula o valor para cada idade
            for (const idadeStr of cliente.idades) {
                const idade = parseInt(idadeStr);
                let valorIdade = 0;

                // Encontra a faixa etária correspondente
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

                detalhamento.push({ idade, valor: valorIdade });
                valorTotal += valorIdade;
            }

            return { valorTotal, detalhamento };
        } catch (error) {
            Scout.recordFailure('flow_error_Uberlandia_pj');
            console.error("Erro ao calcular cotação:", error);
            throw new Error("Falha no cálculo da cotação");
        }
    }

    static obterTabelaPrecos(cliente) {
        try {
            let tabela;
            
            // Verifica a estrutura e corrige o caminho para evitar erro de propriedade indefinida
            if (cliente.qtdBeneficiario === '30-99' && cliente.tipoPlano === 'Nosso Médico') {
                // Verificamos se existe o estrutura específica para Nosso Médico em 30-99
                if (!tabelaHappyVidaPJ.Uberlandia['30-99']['Nosso Médico']) {
                    // Se não existir, procuramos na raiz
                    if (tabelaHappyVidaPJ.Uberlandia['Nosso Médico']) {
                        // Se achou na raiz, usa essa estrutura
                        const baseNossoMedico = tabelaHappyVidaPJ.Uberlandia['Nosso Médico'][cliente.coparticipacao][cliente.segmentacao];
                        
                        if (cliente.acomodacao === 'ENFERM') {
                            return baseNossoMedico['ENFERM'];
                        } else if (cliente.acomodacao === 'APART' && cliente.assistencia) {
                            return baseNossoMedico['APART'][cliente.assistencia];
                        }
                    }
                    
                    // Se não encontrou, usa os valores de 2-29 como fallback
                    console.log("Usando tabela de 2-29 para Nosso Médico como fallback");
                    return tabelaHappyVidaPJ.Uberlandia['2-29']['Nosso Médico'][cliente.coparticipacao][cliente.segmentacao][cliente.acomodacao];
                }
            }
            
            // Caminho normal para estruturas bem definidas
            if (cliente.qtdBeneficiario === '2-29') {
                // Estrutura para 2-29 vidas
                tabela = tabelaHappyVidaPJ.Uberlandia['2-29'][cliente.tipoPlano][cliente.coparticipacao][cliente.segmentacao][cliente.acomodacao];
            } else if (cliente.qtdBeneficiario === '30-99') {
                // Estrutura para 30-99 vidas (com verificação de presença de assistência médica)
                if (cliente.assistencia) {
                    if (cliente.segmentacao === 'AMB+HOSP+OBST' && cliente.acomodacao === 'APART' && 
                        cliente.tipoPlano === 'Nosso Plano' && cliente.coparticipacao === 'Parcial') {
                        // Caso específico onde não há subdivisão por assistência médica
                        tabela = tabelaHappyVidaPJ.Uberlandia['30-99'][cliente.tipoPlano][cliente.coparticipacao][cliente.segmentacao][cliente.acomodacao];
                    } else {
                        // Caso normal com subdivisão por assistência médica
                        tabela = tabelaHappyVidaPJ.Uberlandia['30-99'][cliente.tipoPlano][cliente.coparticipacao][cliente.segmentacao][cliente.acomodacao][cliente.assistencia];
                    }
                } else {
                    throw new Error("Assistência médica não definida para 30-99 vidas");
                }
            }
            
            if (!tabela) {
                console.error('Tabela não encontrada para:\n\n', {
                    qtdBeneficiario: cliente.qtdBeneficiario,
                    tipoPlano: cliente.tipoPlano,
                    coparticipacao: cliente.coparticipacao,
                    segmentacao: cliente.segmentacao,
                    acomodacao: cliente.acomodacao,
                    assistencia: cliente.assistencia
                });
                throw new Error("Tabela de preços não encontrada");
            }
            
            return tabela;
        } catch (error) {
            Scout.recordFailure('flow_error_Uberlandia_pj');
            console.error('Erro ao obter tabela de preços:', error);
            throw error;
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
module.exports = FlowUberlandiaPJ;