export type LanguageText = { text: string; id: number };

export type AnnouncementItem = { title: LanguageText; body: LanguageText; updatedAt: string };

export type LogLevel = 'info' | 'warn' | 'error';
