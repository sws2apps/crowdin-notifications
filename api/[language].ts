import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import requestIp from 'request-ip';

import { Credentials, ProjectsGroups, SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client';
import { crowdinGetLanguageStrings, crowdinGetSourcesStrings } from './services/crowdin.js';
import { cleanUpFinalResponse } from './services/api.js';
import logger from './services/logger.js';

const app = express();

app.set('trust proxy', 1);

app.use(requestIp.mw());

app.use(rateLimit({ windowMs: 1000, max: 20, message: JSON.stringify({ message: 'TOO_MANY_REQUESTS' }) }));

app.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;

    const token = process.env.CROWDIN_API_KEY;
    const projectId = process.env.CROWDIN_PROJECT_ID;
    const fileId = process.env.CROWDIN_FILE_ID;

    if (!token || !projectId || !fileId) {
      const message = 'MISSING_ENV_VARIABLES';

      logger('warn', message, {
        api: {
          client: req.clientIp,
          status: 400,
          path: req.originalUrl,
        },
      });

      res.status(400).json({ message });
      return;
    }

    const credentials: Credentials = { token };

    const projectsGroupsApi = new ProjectsGroups(credentials, {
      httpClientType: 'fetch',
    });

    const projectData = await projectsGroupsApi.getProject(+projectId);
    const sourceLanguage = projectData.data.sourceLanguage.id;

    const sourceStringsApi = new SourceStrings(credentials);
    let strings = await crowdinGetSourcesStrings({
      client: sourceStringsApi,
      projectId: +projectId,
      fileId: +fileId,
    });

    if (language === sourceLanguage) {
      const response = cleanUpFinalResponse(strings);

      logger('info', 'announcements fetched succesfully', {
        api: {
          client: req.clientIp,
          language,
          status: 200,
          path: req.originalUrl,
        },
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

    logger('info', 'announcements fetched succesfully', {
      api: {
        client: req.clientIp,
        language,
        status: 200,
        path: req.originalUrl,
      },
    });

    res.status(200).json(response);
  } catch (err) {
    logger('error', 'error occured while fetching', {
      api: {
        client: req.clientIp,
        error: err,
        status: 500,
        path: req.originalUrl,
      },
    });

    res.status(500).json({ message: 'Internal server error' });
  }
});

export default app;
