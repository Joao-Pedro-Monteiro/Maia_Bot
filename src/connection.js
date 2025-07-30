process.env.TZ = 'America/Sao_Paulo';

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, useMobileConnection } = require('@whiskeysockets/baileys');
const P = require('pino');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const Scout = require('./middlewares/Scout.js');
const MessageHandler = require('./middlewares/MessageHandler.js');

let whatsappSock = null;
let isConnecting = false;

// === ESCOLHA O MODO DE LOGIN: 'qrcode' ou 'numero' ===
const modoDeConexao = 'numero'; // 'qrcode' | 'numero'
const numeroComDDD = '+554499999999'; // Exemplo: +554499999999

class WhatsAppConnection {
    static RealTime() {
        return `[${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}] `;
    }

    static async initialize() {
        if (isConnecting) {
            console.log(this.RealTime() + '⚠️ Já conectando...');
            return;
        }

        isConnecting = true;

        try {
            if (modoDeConexao === 'qrcode') {
                await this.connectWithQRCode();
            } else if (modoDeConexao === 'numero') {
                await this.connectWithPhoneNumber(numeroComDDD);
            } else {
                throw new Error("Modo de conexão inválido. Use 'qrcode' ou 'numero'.");
            }
        } catch (err) {
            console.error(this.RealTime() + '❌ Erro ao conectar:', err);
        } finally {
            isConnecting = false;
        }
    }

    static getSocket() {
        return whatsappSock;
    }

    // === LOGIN POR QR CODE
    static async connectWithQRCode() {
        const { state, saveCreds } = await useMultiFileAuthState('./assets/auth/baileys');
        const sock = makeWASocket({
            auth: state,
            logger: P({ level: 'silent' })
        });

        whatsappSock = sock;
        await this.setupConnectionHandlers(sock, saveCreds);
    }

    // === LOGIN POR NÚMERO DE TELEFONE (SMS)
    static async connectWithPhoneNumber(phoneNumber) {
        const { version } = await fetchLatestBaileysVersion();

        const mobileAuth = await useMobileConnection({
            phoneNumber,
            phoneNumberCountryCode: '55',
            registration: async () => {
                console.log(this.RealTime() + '📲 Solicitando envio do código por SMS...');
                return { method: 'sms' };
            },
            getCode: async () => {
                const code = await this.prompt('Digite o código recebido via SMS:');
                return code;
            }
        });

        const sock = makeWASocket({
            version,
            auth: mobileAuth.state,
            logger: P({ level: 'silent' }),
        });

        whatsappSock = sock;
        await this.setupConnectionHandlers(sock, async () => {});
    }

    // === PROMPT PARA CÓDIGO VIA TERMINAL
    static async prompt(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise(resolve => rl.question(`${question} `, ans => {
            rl.close();
            resolve(ans.trim());
        }));
    }

    // === HANDLERS COMUNS
    static async setupConnectionHandlers(sock, saveCreds) {
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr && modoDeConexao === 'qrcode') {
                console.log(this.RealTime() + '📌 Escaneie o QR Code para conectar:');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode
                    : undefined;

                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                console.log(this.RealTime() + `❌ Conexão fechada (${statusCode})`);

                if (shouldReconnect) {
                    console.log(this.RealTime() + '🔄 Reatando conexão...');
                    await this.initialize();
                } else {
                    console.log(this.RealTime() + '🚫 Sessão encerrada permanentemente.');
                    Scout.recordFailure();
                }
            }

            if (connection === 'open') {
                console.log(this.RealTime() + '✅ Bot conectado com sucesso!');
                Scout.resetQuotation();
                Scout.setStartedTime(new Date());
                Scout.startResourceMonitoring();
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // Interceptar sendMessage com log
        const originalSendMessage = sock.sendMessage;
        sock.sendMessage = async (...args) => {
            try {
                return await originalSendMessage.apply(sock, args);
            } catch (error) {
                Scout.recordFailure();
                throw error;
            }
        };

        // Ativa o MessageHandler
        const handler = new MessageHandler(sock);
        handler.initialize();
    }
}

module.exports = WhatsAppConnection;
