process.env.TZ = 'America/Sao_Paulo';

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('baileys');
const P = require('pino');
const { Boom } = require('@hapi/boom');
const MessageHandler = require('./middlewares/messageHandler.js');
const qrcode = require('qrcode-terminal');
const Scout = require('./middlewares/Scout.js');
let isConnecting = false;
let whatsappSock = null;

class WhatsAppConnection {
    static RealTime() {
        let RT = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        return `[${RT}] `;
    }

    static async initialize() {
        if (isConnecting) {
            console.log(this.RealTime() + '⚠️ Já está tentando conectar. Abortando chamada duplicada.');
            return;
        }

        isConnecting = true;

        const { state, saveCreds } = await useMultiFileAuthState('./assets/auth/baileys');

        const sock = makeWASocket({
            auth: state,
            logger: P({ level: 'silent' }),
        });

        whatsappSock = sock; // Armazena a instância do socket globalmente

        await this.setupConnectionHandlers(sock, saveCreds);

        isConnecting = false;
        return sock;
    }

    static getSocket() {
        return whatsappSock;
    }


    static async setupConnectionHandlers(sock, saveCreds) {
        sock.ev.on('connection.update', async (update) => {
            console.log("🛠️ DEBUG CONNECTION.UPDATE:", update);

            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log(WhatsAppConnection.RealTime() + "📌 Escaneie o QR Code abaixo para conectar:");
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode
                    : undefined;

                console.log(WhatsAppConnection.RealTime() + `❌ Conexão fechada com status: ${statusCode}`);

                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                if (shouldReconnect) {
                    console.log(WhatsAppConnection.RealTime() + "🔄 Tentando reconectar...");
                    await WhatsAppConnection.initialize();
                } else {
                    console.log(WhatsAppConnection.RealTime() + "🚫 Desconectado permanentemente. É necessário excluir a autenticação e conectar novamente.");
                    Scout.recordFailure();
                }
            }

            if (connection === 'open') {
                console.log(WhatsAppConnection.RealTime() + "✅ Bot conectado com sucesso!");
                Scout.resetQuotation();
                Scout.setStartedTime(new Date());
                Scout.startResourceMonitoring();
            }
        });


        sock.ev.on('creds.update', saveCreds);

        // Tracking de erros de envio
        const originalSendMessage = sock.sendMessage;
        sock.sendMessage = async (...args) => {
            try {
                return await originalSendMessage.apply(sock, args);
            } catch (error) {
                Scout.recordFailure();
                throw error;
            }
        };

        // Inicializa o handler de mensagens
        const messageHandler = new MessageHandler(sock);
        messageHandler.initialize();
    }
}

module.exports = WhatsAppConnection;
