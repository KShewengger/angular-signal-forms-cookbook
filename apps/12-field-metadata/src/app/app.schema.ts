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
import { HELP, PLATFORM, STATUS, URL_PREVIEW } from './app.metadata';
import { domainOf, isBareDomain, platformOf } from './app.utils';

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

  metadata(item.url, HELP, ({ valueOf }) => {
    const url = valueOf(item.url).trim();
    if (!domainOf(url)) return undefined;

    return isBareDomain(url)
      ? $localize`:@@urlHelpHomepage:Points to the site homepage.`
      : $localize`:@@urlHelpDeepLink:Links to a specific page.`;
  });

  metadata(item.url, HELP, ({ valueOf }) => {
    const domain = domainOf(valueOf(item.url));

    return domain && platformOf(domain) === 'website'
      ? $localize`:@@urlHelpUnknownSite:Unrecognized site, tagged as Website.`
      : undefined;
  });
});

export function bookmarkHubSchema(
  path: SchemaPathTree<BookmarkCollection>,
): void {
  applyEach(path.bookmarks, bookmarkItemSchema);
}
