import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import requestIp from 'request-ip';

import { check } from 'express-validator';

import { Credentials, ProjectsGroups, SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client';
import { crowdinGetLanguageStrings, crowdinGetSourcesStrings } from './services/crowdin.js';
import { cleanUpFinalResponse } from './services/api.js';
import logger from './services/logger.js';

const app = express();

app.set('trust proxy', 1);

app.use(requestIp.mw());
app.use(express.json());

app.use(rateLimit({ windowMs: 1000, max: 20, message: JSON.stringify({ message: 'TOO_MANY_REQUESTS' }) }));

app.get('/:language', check('language').isString(), check('roles').optional().isArray(), async (req, res) => {
  try {
    const language = req.params?.language ?? 'eng';
    let roles = req.params?.roles ?? [];

    roles = Array.from(new Set([...roles, 'public']))

    const token = process.env.CROWDIN_API_KEY;
    const projectId = process.env.CROWDIN_PROJECT_ID;
    const fileId = process.env.CROWDIN_FILE_ID;

    if (!token || !projectId || !fileId) {
      const message = `missing environment variables`;

      logger('warn', message, {
        method: req.method,
        ip: req.clientIp,
        status: 503,
        path: req.originalUrl,
      });

      res.status(503).json({ message });
      return;
    }

    const credentials: Credentials = { token };

    const projectsGroupsApi = new ProjectsGroups(credentials, {
      httpClientType: 'fetch',
    });

    const projectData = await projectsGroupsApi.getProject(+projectId);
    const sourceLanguage = projectData.data.sourceLanguage.threeLettersCode;

    const sourceStringsApi = new SourceStrings(credentials);

    let strings = await crowdinGetSourcesStrings({
      client: sourceStringsApi,
      projectId: +projectId,
      fileId: +fileId,
      roles
    });

    if (language === sourceLanguage) {
      const response = cleanUpFinalResponse(strings);

      const message = `notifications fetched for language ${language}`;

      logger('info', message, {
        method: req.method,
        ip: req.clientIp,
        language,
        status: 200,
        path: req.originalUrl,
      });

      res.status(200).json(response);
      return;
    }

    const stringTranslationsApi = new StringTranslations(credentials);

    strings = await crowdinGetLanguageStrings({
      client: stringTranslationsApi,
      sources: strings,
      languages: projectData.data.targetLanguages,
      language: language,
      projectId: +projectId,
    });

    const response = cleanUpFinalResponse(strings);

    const message = `notifications fetched for language ${language}`;

    logger('info', message, {
      method: req.method,
      ip: req.clientIp,
      language,
      status: 200,
      path: req.originalUrl,
    });

    res.status(200).json(response);
  } catch (err) {
    const message = `an error occurred: ${String(err)}`;

    logger('error', message, {
      method: req.method,
      ip: req.clientIp,
      status: 500,
      path: req.originalUrl,
    });

    res.status(500).json({ message: 'Internal server error' });
  }
});

export default app;
