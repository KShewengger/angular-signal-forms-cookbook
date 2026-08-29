export type BadgeTone =
  | 'lavender'
  | 'mint'
  | 'pink'
  | 'blue'
  | 'warning'
  | 'danger';

export type Platform =
  | 'repo'
  | 'video'
  | 'design'
  | 'docs'
  | 'notes'
  | 'website';

export type Severity = 'ok' | 'notice' | 'warning';

export type StatusHint = { level: Severity; message: string };

export type LinkPreview = {
  domain: string;
  title: string;
  imageUrl: string | null;
};

export type Bookmark = { id: string; title: string; url: string };

export type BookmarkCollection = { bookmarks: Bookmark[] };

export const TITLE_MAX_LENGTH = 40;

export const INITIAL_COLLECTION: BookmarkCollection = {
  bookmarks: [
    {
      id: 'seed-1',
      title: 'Signal Forms guide',
      url: 'angular.dev/guide/forms/signals',
    },
    { id: 'seed-2', title: '', url: 'github.com/angular/angular' },
  ],
};
