import 'dotenv/config';
import express from 'express';

import { Credentials, ProjectsGroups, SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client';
import { crowdinGetLanguageStrings, crowdinGetSourcesStrings } from './services/crowdin.js';
import { cleanUpFinalResponse } from './services/api.js';

const app = express();

app.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;

    const token = process.env.CROWDIN_API_KEY;
    const projectId = process.env.CROWDIN_PROJECT_ID;
    const fileId = process.env.CROWDIN_FILE_ID;

    if (!token || !projectId || !fileId) {
      res.status(400).json({ message: 'MISSING_VARIABLES' });
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
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default app;
