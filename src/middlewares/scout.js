let startTime = "";
let calculatedQuotations = 0;
let resourceInterval = null;

const metrics = {
    totalMessages: 0,
    failedMessages: 0,
    reconnections: 0,
    lastFailure: null,
    failures: [],
    messagesByHour: {},
    peakUsage: { hour: null, count: 0, date: null },
    avgResponseTime: [],
    systemResources: { cpu: 0, memory: 0, uptime: 0 },
    dailyStats: {},
    userSessions: new Map(),
    errorTypes: {},
    connectionUptime: 0,
    totalDataProcessed: 0
};

class Scout {
    static async getMenu(state) {
        this.updateDailyStats();
        
        let response = "*📊 SISTEMA HAPVIDA BOT - MÉTRICAS AVANÇADAS*\n\n";

        // Informações básicas do sistema
        let upTime = this.getUptime();
        response += `*🚀 SISTEMA*\n`;
        response += `*Uptime:* ${upTime.error ? upTime.message : upTime.formatted}\n`;
        response += `*Versão:* 1.3.0\n`;
        response += `*Status:* ${this.getSystemStatus()}\n\n`;

        // Métricas de uso detalhadas
        response += `*📈 ATIVIDADE*\n`;
        response += `*Mensagens hoje:* ${this.getTodayMessages()}\n`;
        response += `*Total mensagens:* ${metrics.totalMessages.toLocaleString()}\n`;
        response += `*Cotações geradas:* ${calculatedQuotations.toLocaleString()}\n`;
        response += `*Usuários únicos (24h):* ${this.getUniqueUsers()}\n`;
        response += `*Taxa de sucesso:* ${this.getSuccessRate()}%\n`;
        response += `*Dados processados:* ${this.getDataProcessed()}\n\n`;

        // Estatísticas temporais
        response += `*⏰ HORÁRIOS*\n`;
        response += `*Pico de uso:* ${metrics.peakUsage.hour || 'N/A'} (${metrics.peakUsage.count} msgs)\n`;
        response += `*Média por hora:* ${this.getAverageMessagesPerHour()}\n`;
        response += `*Horário atual:* ${this.getCurrentHourStats()}\n\n`;

        // Performance e recursos
        response += `*⚡ PERFORMANCE*\n`;
        response += `*Resposta média:* ${this.getAvgResponseTime()}ms\n`;
        response += `*CPU:* ${metrics.systemResources.cpu.toFixed(1)}%\n`;
        response += `*Memória:* ${metrics.systemResources.memory.toFixed(1)}MB\n`;
        response += `*Carga do sistema:* ${this.getSystemLoad()}\n\n`;

        // Confiabilidade
        response += `*🔗 CONFIABILIDADE*\n`;
        response += `*Reconexões:* ${metrics.reconnections}\n`;
        response += `*Mensagens perdidas:* ${metrics.failedMessages} (${this.getFailureRate()}%)\n`;
        response += `*MTBF:* ${this.getMTBF()}\n`;
        response += `*Última falha:* ${this.getLastFailure()}\n`;
        response += `*Disponibilidade:* ${this.getAvailability()}%\n\n`;

        // Análise de erros
        response += `*🚨 DIAGNÓSTICO*\n`;
        response += `*Tipos de erro:* ${Object.keys(metrics.errorTypes).length}\n`;
        response += `*Erro mais comum:* ${this.getMostCommonError()}\n`;
        response += `*Estabilidade:* ${this.getStabilityIndex()}/10\n\n`;

        response += `_Atualizado em: ${new Date().toLocaleTimeString('pt-BR')}_`;

        // Reset estado
        Object.assign(state, {
            currentMenu: 'main',
            hasShownWelcome: false,
            selectedCity: null,
            previousInput: null,
            cliente: null
        });

        return response;
    }
    
    static setStartedTime(time) {
        startTime = time;
        metrics.connectionUptime = Date.now();
    }

    static addQuotation() {
        calculatedQuotations++;
        metrics.totalDataProcessed += 0.5; // KB estimado por cotação
    }

    static resetQuotation() {
        calculatedQuotations = 0;
    }

    // Controle de monitoramento de recursos
    static startResourceMonitoring() {
        if (resourceInterval) clearInterval(resourceInterval);
        resourceInterval = setInterval(() => this.updateSystemResources(), 3000);
    }

    static stopResourceMonitoring() {
        if (resourceInterval) {
            clearInterval(resourceInterval);
            resourceInterval = null;
        }
    }

    // Tracking avançado de mensagens
    static recordMessage(success = true, responseTime = null, userId = null) {
        metrics.totalMessages++;
        if (!success) {
            metrics.failedMessages++;
            this.recordError('message_processing');
        }
        
        const now = new Date();
        const hour = now.getHours();
        const date = now.toDateString();
        
        // Tracking por hora
        const hourKey = `${date}-${hour}`;
        metrics.messagesByHour[hourKey] = (metrics.messagesByHour[hourKey] || 0) + 1;
        
        // Atualiza horário de pico
        if (metrics.messagesByHour[hourKey] > metrics.peakUsage.count) {
            metrics.peakUsage.hour = `${hour.toString().padStart(2, '0')}:00`;
            metrics.peakUsage.count = metrics.messagesByHour[hourKey];
            metrics.peakUsage.date = date;
        }
        
        // Tracking de usuários únicos
        if (userId) {
            metrics.userSessions.set(userId, now);
            
            // Limpa sessões antigas (mais de 24h)
            for (const [user, lastSeen] of metrics.userSessions.entries()) {
                if (now - lastSeen > 24 * 60 * 60 * 1000) {
                    metrics.userSessions.delete(user);
                }
            }
        }
        
        // Response time tracking
        if (responseTime && responseTime > 0) {
            metrics.avgResponseTime.push(responseTime);
            if (metrics.avgResponseTime.length > 200) {
                metrics.avgResponseTime.shift();
            }
        }
        
        // Estimativa de dados processados
        metrics.totalDataProcessed += 0.1; // KB estimado por mensagem
    }

    static recordReconnection() {
        metrics.reconnections++;
        this.recordError('connection_lost');
    }

    static recordFailure(errorType = 'general') {
        const now = new Date();
        metrics.lastFailure = now;
        metrics.failures.push(now);
        
        this.recordError(errorType);
        
        // Mantém apenas últimas 20 falhas
        if (metrics.failures.length > 20) {
            metrics.failures.shift();
        }
    }

    static recordError(errorType) {
        metrics.errorTypes[errorType] = (metrics.errorTypes[errorType] || 0) + 1;
    }

    static updateSystemResources() {
        try {
            const used = process.memoryUsage();
            metrics.systemResources.memory = used.heapUsed / 1024 / 1024;
            metrics.systemResources.uptime = process.uptime();
            
            // CPU calculation mais preciso
            const usage = process.cpuUsage();
            if (this.lastCpuUsage) {
                const cpuDelta = {
                    user: usage.user - this.lastCpuUsage.user,
                    system: usage.system - this.lastCpuUsage.system
                };
                const total = cpuDelta.user + cpuDelta.system;
                const percent = total / 1000000; // Convert to seconds
                metrics.systemResources.cpu = Math.min(percent * 100, 100);
            }
            this.lastCpuUsage = usage;
        } catch (error) {
            console.error('Erro ao atualizar recursos do sistema:', error);
        }
    }

    static updateDailyStats() {
        const today = new Date().toDateString();
        if (!metrics.dailyStats[today]) {
            metrics.dailyStats[today] = {
                messages: 0,
                quotations: 0,
                errors: 0,
                users: new Set()
            };
        }
    }

    // Métodos de cálculo de métricas
    static getSuccessRate() {
        if (metrics.totalMessages === 0) return 100;
        return ((metrics.totalMessages - metrics.failedMessages) / metrics.totalMessages * 100).toFixed(2);
    }

    static getFailureRate() {
        if (metrics.totalMessages === 0) return 0;
        return (metrics.failedMessages / metrics.totalMessages * 100).toFixed(2);
    }

    static getAvailability() {
        const uptime = this.getUptime();
        if (uptime.error) return 0;
        
        const totalTime = uptime.milliseconds;
        const downtime = metrics.failures.length * 30000; // Assume 30s por falha
        const availability = ((totalTime - downtime) / totalTime) * 100;
        return Math.max(0, availability).toFixed(2);
    }

    static getMTBF() {
        if (metrics.failures.length < 2) return "N/A";
        
        let totalTime = 0;
        for (let i = 1; i < metrics.failures.length; i++) {
            totalTime += metrics.failures[i] - metrics.failures[i-1];
        }
        
        const avgMs = totalTime / (metrics.failures.length - 1);
        const hours = Math.floor(avgMs / 3600000);
        const minutes = Math.floor((avgMs % 3600000) / 60000);
        
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    static getLastFailure() {
        if (!metrics.lastFailure) return "Nenhuma";
        
        const diff = new Date() - metrics.lastFailure;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        if (hours > 0) return `Há ${hours}h ${minutes}m`;
        return `Há ${minutes}m`;
    }

    static getAvgResponseTime() {
        if (metrics.avgResponseTime.length === 0) return 0;
        const sum = metrics.avgResponseTime.reduce((a, b) => a + b, 0);
        return Math.round(sum / metrics.avgResponseTime.length);
    }

    static getTodayMessages() {
        const today = new Date().toDateString();
        let count = 0;
        
        for (const [key, value] of Object.entries(metrics.messagesByHour)) {
            if (key.startsWith(today)) {
                count += value;
            }
        }
        
        return count;
    }

    static getUniqueUsers() {
        const now = new Date();
        let count = 0;
        
        for (const [user, lastSeen] of metrics.userSessions.entries()) {
            if (now - lastSeen <= 24 * 60 * 60 * 1000) {
                count++;
            }
        }
        
        return count;
    }

    static getCurrentHourStats() {
        const now = new Date();
        const hourKey = `${now.toDateString()}-${now.getHours()}`;
        const count = metrics.messagesByHour[hourKey] || 0;
        return `${count} mensagens`;
    }

    static getAverageMessagesPerHour() {
        const hours = Object.keys(metrics.messagesByHour).length;
        if (hours === 0) return "0";
        
        const total = Object.values(metrics.messagesByHour).reduce((a, b) => a + b, 0);
        return Math.round(total / hours).toString();
    }

    static getSystemStatus() {
        const cpu = metrics.systemResources.cpu;
        const memory = metrics.systemResources.memory;
        const failureRate = parseFloat(this.getFailureRate());
        
        if (cpu > 80 || memory > 500 || failureRate > 5) return "⚠️ Atenção";
        if (cpu > 60 || memory > 300 || failureRate > 2) return "⚡ Moderado";
        return "✅ Ótimo";
    }

    static getSystemLoad() {
        const cpu = metrics.systemResources.cpu;
        if (cpu < 30) return "Baixa";
        if (cpu < 60) return "Média";
        if (cpu < 80) return "Alta";
        return "Crítica";
    }

    static getMostCommonError() {
        const errors = Object.entries(metrics.errorTypes);
        if (errors.length === 0) return "Nenhum";
        
        const mostCommon = errors.reduce((a, b) => a[1] > b[1] ? a : b);
        return `${mostCommon[0]} (${mostCommon[1]}x)`;
    }

    static getStabilityIndex() {
        const availability = parseFloat(this.getAvailability());
        const successRate = parseFloat(this.getSuccessRate());
        const avgResponse = this.getAvgResponseTime();
        
        let stability = 10;
        
        // Penaliza por baixa disponibilidade
        if (availability < 99) stability -= (99 - availability) * 0.5;
        
        // Penaliza por baixa taxa de sucesso
        if (successRate < 98) stability -= (98 - successRate) * 0.3;
        
        // Penaliza por resposta lenta
        if (avgResponse > 1000) stability -= Math.min(3, (avgResponse - 1000) / 1000);
        
        return Math.max(0, Math.round(stability));
    }

    static getDataProcessed() {
        if (metrics.totalDataProcessed < 1) return `${(metrics.totalDataProcessed * 1024).toFixed(0)} bytes`;
        if (metrics.totalDataProcessed < 1024) return `${metrics.totalDataProcessed.toFixed(1)} KB`;
        return `${(metrics.totalDataProcessed / 1024).toFixed(1)} MB`;
    }

    static getUptime() {
        if (!startTime) {
            return { 
                error: true, 
                message: "Erro ao obter uptime"
            };
        }

        const startDate = new Date(startTime);
        const currentDate = new Date();
        const diffMs = currentDate - startDate;
        
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        return {
            error: false,
            milliseconds: diffMs,
            seconds: seconds,
            minutes: minutes,
            hours: hours,
            days: days,
            formatted: `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`,
        };
    }

    // Cleanup automático
    static cleanup() {
        // Remove dados antigos para evitar vazamento de memória
        const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias
        
        // Limpa falhas antigas
        metrics.failures = metrics.failures.filter(failure => failure > cutoff);
        
        // Limpa mensagens por hora antigas
        for (const [key, value] of Object.entries(metrics.messagesByHour)) {
            const [date] = key.split('-');
            if (new Date(date) < cutoff) {
                delete metrics.messagesByHour[key];
            }
        }
        
        // Limpa stats diários antigos
        for (const [date, stats] of Object.entries(metrics.dailyStats)) {
            if (new Date(date) < cutoff) {
                delete metrics.dailyStats[date];
            }
        }
    }
}

// Cleanup automático a cada hora
setInterval(() => Scout.cleanup(), 60 * 60 * 1000);

module.exports = Scout;