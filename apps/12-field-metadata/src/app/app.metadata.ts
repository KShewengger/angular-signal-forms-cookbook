import { inject, ResourceRef } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  createManagedMetadataKey,
  createMetadataKey,
  MetadataReducer,
} from '@angular/forms/signals';
import { STATUS_HINTS } from './app.data';
import type { LinkPreview, Platform, Severity, StatusHint } from './app.model';
import { UnfurlService } from './unfurl.service';

const SEVERITY_RANK: Record<Severity, number> = {
  ok: 0,
  notice: 1,
  warning: 2,
};

const severityReducer: MetadataReducer<StatusHint, StatusHint> = {
  getInitial: () => STATUS_HINTS.ready,
  reduce: (acc, item) =>
    SEVERITY_RANK[item.level] > SEVERITY_RANK[acc.level] ? item : acc,
};

export const PLATFORM = createMetadataKey<Platform | undefined>();

export const STATUS = createMetadataKey<StatusHint, StatusHint>(
  severityReducer,
);

export const URL_PREVIEW = createManagedMetadataKey<
  ResourceRef<LinkPreview | undefined>,
  string
>((_state, url) => {
  const unfurl = inject(UnfurlService);

  return rxResource({
    params: () => {
      const value = (url() ?? '').trim();
      return value ? value : undefined;
    },
    stream: ({ params }) => unfurl.preview(params),
  });
});
