process.env.TZ = 'America/Sao_Paulo';

const WhatsAppConnection = require('./src/connection');
const Scout = require('./src/middlewares/scout');

async function startBot() {
    try {
        await WhatsAppConnection.initialize();
        console.log('Bot iniciado com sucesso!');
        
        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('Encerrando bot...');
            Scout.stopResourceMonitoring();
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            console.log('Encerrando bot...');
            Scout.stopResourceMonitoring();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Erro ao iniciar o bot:', error);
        Scout.recordFailure('startup_error');
        process.exit(1);
    }
}

startBot();