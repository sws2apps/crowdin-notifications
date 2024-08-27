import { AnnouncementItem } from '../definition/index.js';

export const cleanUpFinalResponse = (announcements: AnnouncementItem[]) => {
  return announcements.map((announcement) => {
    return {
      updatedAt: announcement.updatedAt,
      title: announcement.title.text,
      body: announcement.body.text,
    };
  });
};
