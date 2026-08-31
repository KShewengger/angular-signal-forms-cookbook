import type {
  BadgeTone,
  BookmarkCollection,
  Platform,
  PlatformInfo,
  Severity,
  StatusHint,
} from './app.model';

export const TITLE_MAX_LENGTH = 40;

export const PRIORITY_MIN = 1;
export const PRIORITY_MAX = 5;
export const PRIORITY_PINNED_MAX = 10;

export const SUGGESTED_PRIORITY_PINNED = 4;
export const SUGGESTED_PRIORITY_REFERENCE = 3;

export const TAG_PATTERN = /^[a-z0-9-]+$/;

export const PATTERN_HINTS: Record<string, string> = {
  [TAG_PATTERN.source]: $localize`:@@tagFormatHint:lowercase, numbers, hyphens`,
};

export const INITIAL_COLLECTION: BookmarkCollection = {
  bookmarks: [
    {
      id: 'seed-1',
      title: 'Angular on GitHub',
      url: 'github.com/angular/angular',
      priority: 3,
      tag: 'framework',
      pinned: false,
    },
  ],
};

export const PLATFORMS: Record<Platform, PlatformInfo> = {
  repo: { badge: $localize`:@@platformRepo:Repo`, tone: 'lavender' },
  video: { badge: $localize`:@@platformVideo:Video`, tone: 'danger' },
  design: { badge: $localize`:@@platformDesign:Design`, tone: 'pink' },
  docs: { badge: $localize`:@@platformDocs:Docs`, tone: 'blue' },
  notes: { badge: $localize`:@@platformNotes:Notes`, tone: 'mint' },
  website: { badge: $localize`:@@platformWebsite:Website`, tone: 'warning' },
};

export const DOMAIN_PLATFORMS: readonly {
  match: string;
  platform: Platform;
}[] = [
  { match: 'github.com', platform: 'repo' },
  { match: 'youtube.com', platform: 'video' },
  { match: 'figma.com', platform: 'design' },
  { match: 'dribbble.com', platform: 'design' },
  { match: 'angular.dev', platform: 'docs' },
  { match: 'notion.so', platform: 'notes' },
];

export const SEVERITY_TONE: Record<Severity, BadgeTone> = {
  ok: 'mint',
  notice: 'blue',
  warning: 'warning',
};

export const SEVERITY_STATE: Record<Severity, 'online' | 'offline' | 'live'> = {
  ok: 'online',
  notice: 'offline',
  warning: 'live',
};

export const STATUS_HINTS = {
  ready: { level: 'ok', message: $localize`:@@statusReady:All set.` },
  needsTitle: {
    level: 'notice',
    message: $localize`:@@statusNeedsTitle:Add a title.`,
  },
  needsLink: {
    level: 'warning',
    message: $localize`:@@statusNeedsLink:Add a link.`,
  },
} satisfies Record<string, StatusHint>;
