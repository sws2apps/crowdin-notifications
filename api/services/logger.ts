import { Logtail } from '@logtail/node';
import { LogLevel } from '../definition/index.js';

const sourceToken = process.env.LOGTAIL_SOURCE_TOKEN;

const logger = (level: LogLevel, message: string) => {
  const logtail = sourceToken ? new Logtail(sourceToken) : undefined;

  if (level === 'info') {
    console.log(message);
    if (logtail) logtail.info(message);
  } else if (level === 'warn') {
    console.warn(message);
    if (logtail) logtail.warn(message);
  } else if (level === 'error') {
    console.error(message);
    if (logtail) logtail.error(message);
  }

  if (logtail) logtail.flush();
};

export default logger;
