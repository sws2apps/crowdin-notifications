import { Logtail } from '@logtail/node';
import { LogLevel } from '../definition/index.js';

const sourceToken = process.env.LOGTAIL_SOURCE_TOKEN;

const logger = (level: LogLevel, message: string) => {
  if (!sourceToken) return;

  const logtail = new Logtail(sourceToken);

  if (level === 'info') {
    logtail.info(message);
  } else if (level === 'warn') {
    logtail.warn(message);
  } else if (level === 'error') {
    logtail.error(message);
  }

  logtail.flush();
};

export default logger;
