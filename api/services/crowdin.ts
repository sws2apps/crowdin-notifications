import { LanguagesModel, SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client';
import { KEY_FORMAT } from '../constants/index.js';
import { AnnouncementItem, LanguageText } from '../definition/index.js';
import { checkDateDelay } from './date.js';

export const crowdinGetSourcesStrings = async ({
  client,
  fileId,
  projectId,
  roles
}: {
  client: SourceStrings;
  projectId: number;
  fileId: number;
  roles: string[]
}) => {
  const stringsData = await client.listProjectStrings(projectId, { fileId });

  const result: AnnouncementItem[] = [];

  const dataTitle = stringsData.data.filter((record) => record.data.identifier.match(KEY_FORMAT));

  const sourcesByRole = dataTitle.filter(source => {
    return source.data.context.split(',').some(role => roles.includes(role))
  })

  for (const { data: title } of sourcesByRole) {
    const titleDate = new Date(title.updatedAt || title.createdAt);

    if (!checkDateDelay(titleDate)) continue;

    const bodyKey = title.identifier.replace('-title', '-body');
    const body = stringsData.data.find((record) => record.data.identifier === bodyKey);

    if (!body) continue;

    const bodyDate = new Date(body.data.updatedAt || body.data.createdAt);

    if (!checkDateDelay(bodyDate)) continue;

    const finalDate = titleDate < bodyDate ? bodyDate : titleDate;

    result.push({
      updatedAt: finalDate.toISOString(),
      title: { id: title.id, text: title.text.toString() },
      body: { id: body.data.id, text: body.data.text.toString() },
    });
  }

  return result;
};

export const crowdinGetLanguageStrings = async ({
  client,
  language,
  languages,
  projectId,
  sources,
}: {
  client: StringTranslations;
  projectId: number;
  sources: AnnouncementItem[];
  language: string;
  languages: LanguagesModel.Language[];
}) => {
  const result: AnnouncementItem[] = [];

  const languageId = languages.find((record) => record.threeLettersCode === language)?.id;

  if (!languageId) return sources;

  for await (const announcement of sources) {
    const languageAnnouncement = structuredClone(announcement);

    const translatable = Object.entries(languageAnnouncement).filter((record) => typeof record[1] === 'object');

    let languageDate = '';

    for await (const [, data] of translatable) {
      const value = data as LanguageText;

      const approvalResult = await client.listTranslationApprovals(projectId, {
        stringId: value.id,
        languageId: languageId,
      });

      if (approvalResult.data.length > 0) {
        const translationId = approvalResult.data.at(0)!.data.translationId;

        const translationData = await client.translationInfo(projectId, translationId);

        const target = translationData.data;

        value.text = target.text.toString();

        if (languageDate.length === 0) {
          languageDate = target.createdAt;
        } else {
          languageDate = languageDate < target.createdAt ? target.createdAt : languageDate;
        }
      }
    }

    if (languageDate.length > 0) {
      languageAnnouncement.updatedAt = languageDate;
    }

    result.push(languageAnnouncement);
  }

  return result;
};
