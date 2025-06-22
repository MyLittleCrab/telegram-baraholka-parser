// Prints log to stdout with data
// can handle different log levels
// can be extended to log to files or external services
// reads env variable LOG_LEVEL to determine the minimum log level to print

export default class Logger {
    constructor(logName = 'default') {
        this.logName = logName;
    }

    debug(message) {
        this.log(message, 'debug');
    }

    info(message) {
        this.log(message, 'info');
    }

    warn(message) {
        this.log(message, 'warn');
    }

    error(message) {
        this.log(message, 'error');
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logLevel = process.env.LOG_LEVEL || 'info';
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(logLevel);
        const messageLevelIndex = levels.indexOf(level);

        // If the message level is lower than the current log level, do not log it
        if (messageLevelIndex < currentLevelIndex) {
            return;
        }

        if (level === 'error') {
            console.error(`[${timestamp}] [${level.toUpperCase()}] [${this.logName}]: ${message}`);
        } else if (level === 'warn') {
            console.warn(`[${timestamp}] [${level.toUpperCase()}] [${this.logName}]: ${message}`);
        } else if (level === 'debug') {
            console.debug(`[${timestamp}] [${level.toUpperCase()}] [${this.logName}]: ${message}`);
        } else {
            // Default to info level
            console.info(`[${timestamp}] [${level.toUpperCase()}] [${this.logName}]: ${message}`);
        }

    }

}