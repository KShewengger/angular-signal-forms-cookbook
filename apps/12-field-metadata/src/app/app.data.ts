import type { BadgeTone, Platform, Severity, StatusHint } from './app.model';

export type PlatformInfo = { badge: string; tone: BadgeTone };

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
