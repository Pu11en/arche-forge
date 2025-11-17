/**
 * Logging utility with environment-aware logging
 * In production, only errors and warnings are logged
 * In development, all logs are shown
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableProductionLogging: boolean;
}

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = (import.meta as any).env?.DEV || process.env.NODE_ENV === 'development';
    this.config = {
      level: 'info',
      enableProductionLogging: false
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log errors and warnings in production if enabled
    if (!this.isDevelopment) {
      if (!this.config.enableProductionLogging) return false;
      return level === 'error' || level === 'warn';
    }
    
    // In development, log everything
    return true;
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...args);
    }
  }

  log(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...args);
    }
  }

  // For video debugging - only in development
  videoDebug(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('🎥 Video Debug:', ...args);
    }
  }

  // For performance monitoring - only in development or high severity in production
  performance(severity: 'low' | 'medium' | 'high', ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`⚡ Performance (${severity}):`, ...args);
    } else if (severity === 'high') {
      console.warn('⚠️ Performance Issue:', ...args);
    }
  }

  // For service worker debugging - only in development
  serviceWorker(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('🔧 Service Worker:', ...args);
    }
  }

  // For browser detection debugging - only in development
  browserDetection(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('🌐 Browser Detection:', ...args);
    }
  }
}

export const logger = new Logger();