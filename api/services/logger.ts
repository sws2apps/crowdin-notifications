import { Logtail } from '@logtail/node';
import { Context } from '@logtail/types';
import { LogLevel } from '../definition/index.js';

const sourceToken = process.env.LOGTAIL_SOURCE_TOKEN;
const sourceEndpoint = process.env.LOGTAIL_ENDPOINT;

const logger = async (level: LogLevel, message: string, context?: Context) => {
  const logtail = sourceToken && sourceEndpoint ? new Logtail(sourceToken, { endpoint: sourceEndpoint }) : undefined;

  if (level === 'info') {
    console.log(message);
    if (logtail) logtail.info(message, context);
  } else if (level === 'warn') {
    console.warn(message);
    if (logtail) logtail.warn(message, context);
  } else if (level === 'error') {
    console.error(message);
    if (logtail) logtail.error(message, context);
  }

  if (logtail) logtail.flush();
};

export default logger;
