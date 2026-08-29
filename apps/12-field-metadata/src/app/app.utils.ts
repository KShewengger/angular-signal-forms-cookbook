import { DOMAIN_PLATFORMS } from './app.data';
import type { Platform } from './app.model';

export function domainOf(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const host = new URL(withProtocol).hostname.replace(/^www\./, '');
    return host.includes('.') ? host : null;
  } catch {
    return null;
  }
}

export function platformOf(domain: string): Platform {
  const hit = DOMAIN_PLATFORMS.find(
    (entry) => domain === entry.match || domain.endsWith(`.${entry.match}`),
  );
  return hit ? hit.platform : 'website';
}
