import pinoHttp from 'pino-http';
import pino from 'pino';

const pretty = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
});

export const logger = pinoHttp({ logger: pretty });
