import {
  DOMAIN_PLATFORMS,
  PATTERN_HINTS,
  PRIORITY_MAX,
  PRIORITY_MIN,
  PRIORITY_PINNED_MAX,
} from './app.data';
import type {
  Bookmark,
  LinkPreview,
  MicrolinkResponse,
  Platform,
} from './app.model';

export function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function isInsecureUrl(raw: string): boolean {
  return /^http:\/\//i.test(raw.trim());
}

export function parseUrl(raw: string): { domain: string; path: string } | null {
  const value = raw.trim();
  if (!value) return null;

  try {
    const { hostname, pathname } = new URL(withProtocol(value));
    const domain = hostname.replace(/^www\./, '');
    return domain.includes('.') ? { domain, path: pathname } : null;
  } catch {
    return null;
  }
}

export function domainOf(raw: string): string | null {
  return parseUrl(raw)?.domain ?? null;
}

export function patternHint(expression: RegExp): string {
  return PATTERN_HINTS[expression.source] ?? expression.source;
}

export function sortPriority(bookmark: Bookmark): number {
  const max = bookmark.pinned ? PRIORITY_PINNED_MAX : PRIORITY_MAX;
  const withinRange =
    bookmark.priority >= PRIORITY_MIN && bookmark.priority <= max;

  return withinRange ? bookmark.priority : PRIORITY_MIN;
}

export function platformOf(domain: string): Platform {
  const hit = DOMAIN_PLATFORMS.find(
    (entry) => domain === entry.match || domain.endsWith(`.${entry.match}`),
  );
  return hit ? hit.platform : 'website';
}

export function toLinkPreview(response: MicrolinkResponse): LinkPreview {
  if (response.status !== 'success' || !response.data) {
    throw new Error('unreachable');
  }

  const data = response.data;
  const domain = data.publisher?.trim() || domainOf(data.url ?? '') || '';

  return {
    domain,
    title: data.title?.trim() || domain,
    imageUrl: data.logo?.url ?? data.image?.url ?? null,
  };
}
