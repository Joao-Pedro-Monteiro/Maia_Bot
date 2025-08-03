const fs = require('fs');
const path = require('path');

const coursesDataPath = path.resolve(__dirname, '../../docs/avaliableCourses/courses.json');
const coursesData = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'))

class MenuTimeline{

    static async execute (userInput, state){
        switch (parseInt(userInput)) {
            case 1: //* Curso de Desenvolvimento Web Básico
                this.resetAndReturnToMain(state);
                return [
                    {
                        document: { url: coursesData['Desenvolvimento_Web_Basico']['timeline'] },
                        mimetype: 'application/pdf',
                        fileName: 'Cronograma_Desenvolvimento_Web_Basico.pdf',
                        caption: null
                    },
                    {text: "Este é o cronograma do curso de Desenvolvimento Web Básico.\n\nEstou encerrando este atendimento, mas se precisar de mais alguma coisa, é só me mandar uma mensagem! 😊"}
                ]

            default:
                return "⚠️ Opção inválida.\n" + this.getMenu();
        }

    }


    static resetAndReturnToMain(state) {
        this.resetState(state);
        return null; // Retorna null para que o MessageHandler reinicie o menu principal
    }

    static resetState(state) {
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: false,
            selectedCity: null,
            previousInput: null
        });
        return null;
    }

    static getMenu() {
        return this.formatMenu({
            title: "📅 No momento, tenho disponível os cronogramas dos seguintes cursos que estão acontecendo:",
            options: {
                1: "Curso de Desenvolvimento Web Básico",
            }
        })
    }

    static formatMenu(menuData) {
        let response = `${menuData.title}\n\n`;
        Object.entries(menuData.options).forEach(([key, value]) => {
            response += `*${key}* - ${value}\n`;
        });
        return response;
    }

}
module.exports = MenuTimeline;