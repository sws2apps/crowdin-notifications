import { AnnouncementItem } from '../definition/index.js';

export const cleanUpFinalResponse = (announcements: AnnouncementItem[]) => {
  return announcements.map((announcement) => {
    return {
      id: announcement.title.id,
      updatedAt: announcement.updatedAt,
      title: announcement.title.text,
      desc: announcement.body.text,
    };
  });
};
