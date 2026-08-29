import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import type { LinkPreview } from './app.model';
import { domainOf } from './app.utils';

type MicrolinkResponse = {
  status: string;
  data?: {
    title?: string | null;
    publisher?: string | null;
    image?: { url?: string } | null;
    logo?: { url?: string } | null;
  };
};

const MICROLINK_ENDPOINT = 'https://api.microlink.io/';

@Service()
export class UnfurlService {
  private readonly http = inject(HttpClient);

  preview(url: string): Observable<LinkPreview> {
    const domain = domainOf(url);

    if (!domain) {
      return throwError(() => new Error('unreachable'));
    }

    const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const endpoint = `${MICROLINK_ENDPOINT}?url=${encodeURIComponent(target)}`;

    return this.http.get<MicrolinkResponse>(endpoint).pipe(
      map((response) => {
        if (response.status !== 'success' || !response.data) {
          throw new Error('unreachable');
        }

        return {
          domain,
          title:
            response.data.title?.trim() ||
            response.data.publisher?.trim() ||
            domain,
          imageUrl: response.data.logo?.url ?? response.data.image?.url ?? null,
        } satisfies LinkPreview;
      }),
    );
  }
}
