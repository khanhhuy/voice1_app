import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production'

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (!isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export { logger }
