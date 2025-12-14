type LogLevel = 'info' | 'warn' | 'error';

class Logger {
    private isDevelopment = import.meta.env.DEV;

    info(message: string, ...args: any[]) {
        if (this.isDevelopment) {
            console.info(`[INFO] ${message}`, ...args);
        }
    }

    warn(message: string, ...args: any[]) {
        console.warn(`[WARN] ${message}`, ...args);
    }

    error(message: string, ...args: any[]) {
        console.error(`[ERROR] ${message}`, ...args);
    }
}

export const logger = new Logger();
