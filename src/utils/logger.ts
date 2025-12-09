import winston from 'winston';
// import path from 'path';

const { combine, timestamp, printf, colorize, align, errors } = winston.format;

// Directory for log files
const logDir = 'logs';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // Log the full stack trace
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    // Console transport with colorization for development
    new winston.transports.Console({
      format: combine(
        colorize(),
        align(),
        printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      dirname: logDir,
      filename: 'combined.log',
    }),
    // File transport for error logs
    new winston.transports.File({
      dirname: logDir,
      filename: 'error.log',
      level: 'error',
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ dirname: logDir, filename: 'exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ dirname: logDir, filename: 'rejections.log' }),
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

// Create a stream object with a 'write' function that will be used by morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;