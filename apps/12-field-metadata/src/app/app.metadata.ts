import { httpResource } from '@angular/common/http';
import { Signal } from '@angular/core';
import {
  createManagedMetadataKey,
  createMetadataKey,
  MetadataReducer,
} from '@angular/forms/signals';
import { MICROLINK_ENDPOINT, STATUS_HINTS } from './app.data';
import type {
  LinkPreview,
  MicrolinkResponse,
  Platform,
  Severity,
  StatusHint,
} from './app.model';
import { domainOf, toLinkPreview, withProtocol } from './app.utils';

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

export const PIN_NOTE = createMetadataKey<string | undefined>();

export const STATUS = createMetadataKey<StatusHint, StatusHint>(
  severityReducer,
);

export const HELP = createMetadataKey(MetadataReducer.list<string>());

export const TAG_HINT = createMetadataKey(MetadataReducer.list<string>());

export const URL_PREVIEW = createManagedMetadataKey(
  (_state, url: Signal<string | undefined>) =>
    httpResource<LinkPreview>(
      () => {
        const value = (url() ?? '').trim();
        const domain = domainOf(value);

        return domain
          ? {
              url: MICROLINK_ENDPOINT,
              params: { url: withProtocol(value) },
            }
          : undefined;
      },
      { parse: (raw) => toLinkPreview(raw as MicrolinkResponse) },
    ),
);
