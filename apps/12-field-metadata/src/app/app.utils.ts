import { DOMAIN_PLATFORMS } from './app.data';
import type { LinkPreview, MicrolinkResponse, Platform } from './app.model';

export function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function domainOf(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  try {
    const host = new URL(withProtocol(value)).hostname.replace(/^www\./, '');
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
