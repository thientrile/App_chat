/** @format */

import { format, createLogger, transports } from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, align, printf, colorize } = format;
import path from "path";
const LOGS_BASE_PATH = path.resolve(process.cwd(), "storage", "logs");

/* 
level: ['info','error','warning','debug','silly'],

*/

class Mylogger {
  constructor() {
    // Colors for different log levels
    const colors = {
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      info: '\x1b[36m',    // Cyan
      debug: '\x1b[35m',   // Magenta
      verbose: '\x1b[37m', // White
      silly: '\x1b[90m',   // Gray
      reset: '\x1b[0m'     // Reset
    };

    // Icons for different contexts
    const getContextIcon = (context) => {
      const icons = {
        'REQUEST': '🌐',
        'RESPONSE': '📤',
        'ERROR': '❌',
        'DATABASE': '🗄️',
        'AUTH': '🔐',
        'API': '🔌',
        'SYSTEM': '⚙️',
        'PERFORMANCE': '⚡',
        'SECURITY': '🛡️',
        'SERVER': '🚀',
        'LOGGER_INIT': '📝'
      };
      return icons[context] || '📄';
    };

    // Format for file logging (no colors)
    const fileFormatPrint = printf(
      ({ level, message, context, requestId, timestamp, metadata }) => {
        return `${timestamp}::${level.toUpperCase()}::${context}::${requestId}::${message}::${JSON.stringify(metadata)}`;
      }
    );

    // Format for console with colors and icons
    const consoleFormatPrint = printf(
      ({ level, message, context, requestId, timestamp, metadata }) => {
        const color = colors[level] || colors.reset;
        const icon = getContextIcon(context);
        const levelUpper = level.toUpperCase().padEnd(7);
        const contextFormatted = context ? `[${context}]`.padEnd(12) : ''.padEnd(12);
        const requestIdFormatted = requestId ? `(${requestId})` : '';
        
        // Format metadata nicely
        let metadataStr = '';
        if (metadata && Object.keys(metadata).length > 0) {
          metadataStr = '\n' + '  📋 ' + colors.reset + JSON.stringify(metadata, null, 2)
            .split('\n')
            .map((line, index) => index === 0 ? line : '     ' + line)
            .join('\n');
        }

        return `${color}${icon} ${timestamp} ${levelUpper}${colors.reset} ${contextFormatted}${requestIdFormatted} ${message}${metadataStr}${colors.reset}`;
      }
    );

    this.logger = createLogger({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
      ),
      transports: [
        // Console transport with beautiful formatting
        new transports.Console({
          format: combine(
            colorize({ all: false }), // We'll handle colors manually
            consoleFormatPrint
          )
        }),
        // File transport for info logs
        new transports.DailyRotateFile({
          level: "info",
          filename: "application-%DATE%.info.log",
          dirname: `${LOGS_BASE_PATH}/%DATE%`,
          datePattern: "YYYY-MM-DD-HH",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
          format: combine(
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            fileFormatPrint
          ),
        }),
        // File transport for error logs
        new transports.DailyRotateFile({
          level: "error",
          filename: "application-%DATE%.error.log",
          dirname: `${LOGS_BASE_PATH}/%DATE%`,
          datePattern: "YYYY-MM-DD-HH",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
          format: combine(
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            fileFormatPrint
          ),
        }),
        
      ],
    });
  }
  commonParms(params) {
    let context, req, metadata;
    if (!Array.isArray(params)) {
      context = params;
    } else {
      [context, req, metadata] = params;
    }

    const requestId = req ? req.requestId : "";
    return {
      requestId,
      context,
      metadata: sanitizeData(metadata),
    };
  }
  // Info level (alias for log)
  log(message, params) {
    const paramLog = this.commonParms(params);
    const logObject = Object.assign({ message }, paramLog);
    this.logger.info(logObject);
  }

  // Info level
  info(message, params) {
    const paramLog = this.commonParms(params);
    const logObject = Object.assign({ message }, paramLog);
    this.logger.info(logObject);
  }

  // Error level
  error(message, params) {
    const paramLog = this.commonParms(params);
    const logObject = Object.assign({ message }, paramLog);
    this.logger.error(logObject);
  }

  // Warning level
  warn(message, params) {
    const paramLog = this.commonParms(params);
    const logObject = Object.assign({ message }, paramLog);
    this.logger.warn(logObject);
  }

  // Warning level (alias)
  warning(message, params) {
    const paramLog = this.commonParms(params);
    const logObject = Object.assign({ message }, paramLog);
    this.logger.warn(logObject);
  }

  // Debug level
  debug(message, params) {
    const paramLog = this.commonParms(params);
    const logObject = Object.assign({ message }, paramLog);
    this.logger.debug(logObject);
  }

  // Verbose level
  verbose(message, params) {
    const paramLog = this.commonParms(params);
    const logObject = Object.assign({ message }, paramLog);
    this.logger.verbose(logObject);
  }

  // Silly level (most detailed)
  silly(message, params) {
    const paramLog = this.commonParms(params);
    const logObject = Object.assign({ message }, paramLog);
    this.logger.silly(logObject);
  }
}
// ẩn thông tin nhạy cảm
const sanitizeData = (data) => {
  if (!data) return data;

  const maskedData = { ...data };

  const sensitiveKeys = ["password", "token", "email", "creditCard","username"];

  for (const key of sensitiveKeys) {
    if (maskedData[key]) maskedData[key] = "******";
  }

  return maskedData;
};

export default Mylogger;
