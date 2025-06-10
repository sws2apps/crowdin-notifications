import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import requestIp from 'request-ip';
import logger from './services/logger.js';

const app = express();

app.set('trust proxy', 1);

app.use(requestIp.mw());

app.use(rateLimit({ windowMs: 1000, max: 20, message: JSON.stringify({ message: 'TOO_MANY_REQUESTS' }) }));

app.get('/', async (req, res) => {
  const message = `welcome to the crowdin notification api`;

  logger('info', message, {
    method: req.method,
    path: req.originalUrl,
    ip: req.clientIp,
    status: 200,
  });

  res.status(200).json({ message });
});

export default app;
