import {
  applyEach,
  applyWhen,
  debounce,
  max,
  maxLength,
  metadata,
  min,
  pattern,
  PATTERN,
  required,
  schema,
  SchemaPathTree,
} from '@angular/forms/signals';
import {
  PRIORITY_MAX,
  PRIORITY_MIN,
  PRIORITY_PINNED_MAX,
  STATUS_HINTS,
  TAG_PATTERN,
  TITLE_MAX_LENGTH,
} from './app.data';
import { type Bookmark, type BookmarkCollection } from './app.model';
import {
  HELP,
  PIN_NOTE,
  PLATFORM,
  STATUS,
  TAG_HINT,
  URL_PREVIEW,
} from './app.metadata';
import { domainOf, parseUrl, patternHint, platformOf } from './app.utils';

export const bookmarkItemSchema = schema<Bookmark>((item) => {
  required(item.url, {
    message: $localize`:@@urlRequired:Add a link before saving.`,
  });

  maxLength(item.title, TITLE_MAX_LENGTH, {
    message: $localize`:@@titleTooLong:Titles stay under ${TITLE_MAX_LENGTH}:max: characters.`,
  });

  min(item.priority, PRIORITY_MIN, {
    message: $localize`:@@priorityMin:Priority starts at ${PRIORITY_MIN}:min:.`,
  });

  max(
    item.priority,
    ({ valueOf }) =>
      valueOf(item.pinned) ? PRIORITY_PINNED_MAX : PRIORITY_MAX,
    {
      message: $localize`:@@priorityMax:Priority is above the allowed maximum.`,
    },
  );

  pattern(item.tag, TAG_PATTERN, {
    message: $localize`:@@tagPattern:Use lowercase letters, numbers, and hyphens.`,
  });

  applyWhen(
    item,
    ({ value }) => value().pinned,
    (pinnedItem) => {
      metadata(
        pinnedItem,
        PIN_NOTE,
        () =>
          $localize`:@@pinNote:Pinned: shown first, priority ceiling raised to ${PRIORITY_PINNED_MAX}:max:.`,
      );
    },
  );

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
    const parsed = parseUrl(valueOf(item.url));
    if (!parsed) return undefined;

    return parsed.path === '/'
      ? $localize`:@@urlHelpHomepage:Points to the site homepage.`
      : $localize`:@@urlHelpDeepLink:Links to a specific page.`;
  });

  metadata(item.url, HELP, ({ valueOf }) => {
    const domain = domainOf(valueOf(item.url));

    return domain && platformOf(domain) === 'website'
      ? $localize`:@@urlHelpUnknownSite:Unrecognized site, tagged as Website.`
      : undefined;
  });

  metadata(item.tag, TAG_HINT, ({ state }) => {
    const [expression] = state.metadata(PATTERN)?.() ?? [];

    return expression ? patternHint(expression) : undefined;
  });
});

export function bookmarkHubSchema(
  path: SchemaPathTree<BookmarkCollection>,
): void {
  applyEach(path.bookmarks, bookmarkItemSchema);
}
