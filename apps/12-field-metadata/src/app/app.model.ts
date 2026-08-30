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

export type PlatformInfo = { badge: string; tone: BadgeTone };

export type Severity = 'ok' | 'notice' | 'warning';

export type StatusHint = { level: Severity; message: string };

export type LinkPreview = {
  domain: string;
  title: string;
  imageUrl: string | null;
};

export type MicrolinkResponse = {
  status: string;
  data?: {
    title?: string | null;
    publisher?: string | null;
    url?: string | null;
    image?: { url?: string } | null;
    logo?: { url?: string } | null;
  };
};

export type Bookmark = { id: string; title: string; url: string };

export type BookmarkCollection = { bookmarks: Bookmark[] };
