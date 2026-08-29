import {
  applyEach,
  debounce,
  maxLength,
  metadata,
  required,
  schema,
  SchemaPathTree,
} from '@angular/forms/signals';
import { STATUS_HINTS, TITLE_MAX_LENGTH } from './app.data';
import { type Bookmark, type BookmarkCollection } from './app.model';
import { PLATFORM, STATUS, URL_PREVIEW } from './app.metadata';
import { domainOf, platformOf } from './app.utils';

export const bookmarkItemSchema = schema<Bookmark>((item) => {
  required(item.url, {
    message: $localize`:@@urlRequired:Add a link before saving.`,
  });

  maxLength(item.title, TITLE_MAX_LENGTH, {
    message: $localize`:@@titleTooLong:Titles stay under ${TITLE_MAX_LENGTH}:max: characters.`,
  });

  debounce(item.url, 500);

  metadata(item.url, PLATFORM, ({ value }) => {
    const domain = domainOf(value());
    return domain ? platformOf(domain) : undefined;
  });

  metadata(item.url, URL_PREVIEW, ({ value }) => value());

  metadata(item, STATUS, ({ valueOf }) =>
    valueOf(item.url).trim() ? STATUS_HINTS.ready : STATUS_HINTS.needsLink,
  );

  metadata(item, STATUS, ({ valueOf }) =>
    valueOf(item.title).trim() ? STATUS_HINTS.ready : STATUS_HINTS.needsTitle,
  );
});

export function bookmarkHubSchema(
  path: SchemaPathTree<BookmarkCollection>,
): void {
  applyEach(path.bookmarks, bookmarkItemSchema);
}
