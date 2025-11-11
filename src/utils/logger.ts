export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4,
};

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: string;
    metadata?: Record<string, any>;
    stack?: string;
}

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export class Logger {
    private static readonly LEVEL_NAMES: Record<LogLevel, string> = {
        [LogLevel.DEBUG]: 'DEBUG',
        [LogLevel.INFO]: 'INFO ',
        [LogLevel.WARN]: 'WARN ',
        [LogLevel.ERROR]: 'ERROR',
        [LogLevel.FATAL]: 'FATAL',
    };
    constructor() {}

    private formatTimestamp(date: Date): string {
        return date.toISOString();
    }

    private formatMessage(entry: LogEntry): string {
        const parts: string[] = [];
        const timestamp = this.formatTimestamp(entry.timestamp);
        parts.push(timestamp);

        const levelName = Logger.LEVEL_NAMES[entry.level];
        const formattedLevel = `[${levelName}]`;
        parts.push(formattedLevel);

        if (entry.context) {
            const ctx = entry.context;
            const formattedContext = `[${ctx}]`;
            parts.push(formattedContext);
        }

        parts.push(entry.message);

        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
            parts.push(JSON.stringify(entry.metadata, null, 2));
        }

        if (entry.stack) {
            parts.push(`\n${entry.stack}`);
        }

        return parts.join(' ');
    }

    private log(level: LogLevel, message: string, metadata?: Record<string, any>, context?: string): void {
        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            message,
            context,
            metadata,
        };

        entry.stack = metadata?.error?.stack;

        const consoleMessage = this.formatMessage(entry);

        switch (level) {
            case LogLevel.DEBUG:
            case LogLevel.INFO:
                console.log(consoleMessage);
                break;
            case LogLevel.WARN:
                console.warn(consoleMessage);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(consoleMessage);
                break;
        }
    }

    public debug(message: string, metadata?: Record<string, any>, context?: string): void {
        this.log(LogLevel.DEBUG, message, metadata, context);
    }

    public info(message: string, metadata?: Record<string, any>, context?: string): void {
        this.log(LogLevel.INFO, message, metadata, context);
    }

    public warn(message: string, metadata?: Record<string, any>, context?: string): void {
        this.log(LogLevel.WARN, message, metadata, context);
    }

    public error(message: string, error?: Error | Record<string, any>, context?: string): void {
        const metadata = error instanceof Error ? { error } : error;
        this.log(LogLevel.ERROR, message, metadata, context);
    }

    public fatal(message: string, error?: Error | Record<string, any>, context?: string): void {
        const metadata = error instanceof Error ? { error } : error;
        this.log(LogLevel.FATAL, message, metadata, context);
    }
}

export const logger = new Logger();
