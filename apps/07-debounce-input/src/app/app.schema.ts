import {
  debounce,
  pattern,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import { ALLOWED_FRUITS, FRUITS, QUERY_PATTERN } from './app.data';
import { SearchFormModel } from './app.model';

export function searchSchema(path: SchemaPathTree<SearchFormModel>): void {
  pattern(path.query, QUERY_PATTERN, {
    message: 'No special characters allowed.',
  });

  validate(path.query, ({ value }) => {
    const raw = value();
    const q = raw.trim().toLowerCase();

    if (!q || !QUERY_PATTERN.test(raw)) return null;

    return FRUITS.some((fruit) => fruit.name.toLowerCase().includes(q))
      ? null
      : {
          kind: 'unknownFruit',
          message: `Try one of: ${ALLOWED_FRUITS}.`,
        };
  });

  debounce(path.query, 400);
}
