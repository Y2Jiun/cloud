import { env, isProduction, isDevelopment } from "../config/env";

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Logger interface
interface Logger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// Console logger implementation
class ConsoleLogger implements Logger {
  private getLogLevel(): LogLevel {
    if (isProduction()) {
      return LogLevel.ERROR; // Only show errors in production
    }
    return LogLevel.DEBUG; // Show all logs in development
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (meta) {
      return `${prefix} ${message} ${JSON.stringify(meta, null, 2)}`;
    }

    return `${prefix} ${message}`;
  }

  error(message: string, meta?: any): void {
    if (this.getLogLevel() >= LogLevel.ERROR) {
      console.error(this.formatMessage("ERROR", message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.getLogLevel() >= LogLevel.WARN) {
      console.warn(this.formatMessage("WARN", message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.getLogLevel() >= LogLevel.INFO) {
      console.info(this.formatMessage("INFO", message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.getLogLevel() >= LogLevel.DEBUG) {
      console.debug(this.formatMessage("DEBUG", message, meta));
    }
  }
}

// File logger implementation (for production)
class FileLogger implements Logger {
  // In a real production environment, you'd implement file logging here
  // For now, we'll use console but with production-appropriate levels

  error(message: string, meta?: any): void {
    console.error(`[ERROR] ${message}`, meta);
  }

  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, meta);
  }

  info(message: string, meta?: any): void {
    // In production, only log important info
    if (
      message.includes("Server running") ||
      message.includes("Database connected")
    ) {
      console.info(`[INFO] ${message}`);
    }
  }

  debug(message: string, meta?: any): void {
    // No debug logs in production
  }
}

// Create logger instance based on environment
export const logger: Logger = isProduction()
  ? new FileLogger()
  : new ConsoleLogger();

// Convenience functions
export const logError = (message: string, error?: any): void => {
  logger.error(message, error);
};

export const logWarn = (message: string, meta?: any): void => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any): void => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any): void => {
  logger.debug(message, meta);
};

// Database logging
export const logDatabase = (message: string, meta?: any): void => {
  logger.info(`[DATABASE] ${message}`, meta);
};

// Authentication logging
export const logAuth = (message: string, meta?: any): void => {
  logger.info(`[AUTH] ${message}`, meta);
};

// File upload logging
export const logUpload = (message: string, meta?: any): void => {
  logger.info(`[UPLOAD] ${message}`, meta);
};

// API request logging
export const logRequest = (
  method: string,
  path: string,
  statusCode: number,
  duration: number
): void => {
  const level = statusCode >= 400 ? "warn" : "info";
  const message = `${method} ${path} - ${statusCode} (${duration}ms)`;

  if (level === "warn") {
    logger.warn(`[REQUEST] ${message}`);
  } else {
    logger.info(`[REQUEST] ${message}`);
  }
};
