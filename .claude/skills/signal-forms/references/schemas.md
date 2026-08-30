# Schemas: the three shapes and when to use each

A schema wires validators (and metadata) onto a form's fields. There are exactly three
shapes in this cookbook. Pick by reuse and length, not by taste. Do not reach for the
heaviest shape (`schema<T>()`) unless the same rules are genuinely applied more than
once.

## Shape 1: inline schema function

A short one-form schema (roughly 1-5 lines) is inlined as the second argument to
`form()`. No separate file, no export. Recipe 01 (`apps/01-basic-form`):

```ts
protected readonly userForm = form(this.userModel, (path) => {
  required(path.name);
});
```

Use this when the rules are trivial and no test needs to import them in isolation (the
isolated test just repeats the same callback). Wrapping a single-use inline schema in
`schema()` is noise.

## Shape 2: named exported `SchemaFn` in `app.schema.ts`

A longer one-form schema moves to a named, exported function so isolated tests can
import it. This is the default for any recipe with real validation. Recipe 02
(`apps/02-built-in-validations/app.schema.ts`):

```ts
import { email, maxLength, min, minLength, pattern, required, SchemaPathTree } from '@angular/forms/signals';
import { RegistrationFormModel } from './app.model';

export function registrationSchema(path: SchemaPathTree<RegistrationFormModel>): void {
  required(path.username, { message: 'Please enter a username.' });
  minLength(path.username, 5, { message: 'Username must be at least 5 characters long.' });
  maxLength(path.username, 20, { message: 'Username cannot exceed 20 characters.' });
  pattern(path.username, /^USER-\d{3}$/, { message: 'Username must follow the format USER-123.' });

  required(path.email, { message: 'Please enter your email address.' });
  email(path.email, { message: 'Please enter a valid email address.' });
  // ...
}
```

Then the component just references it: `form(this.userModel, registrationSchema, { ... })`.

Type it with `SchemaPathTree<T>` for a top-level `SchemaFn`, or the `SchemaFn<T>` type
alias for reusable per-field groups (see Shape 3). This is still **one form, applied
once** - it is a plain function, not a `schema()` object.

## Shape 3: `schema<T>()` object - only when applied more than once

Reach for Angular's `schema<T>()` **only** when the same `Schema` object is applied to
more than one path or form: via `apply`, `applyEach`, or a second `form()`. A
`schema<T>()` used exactly once is over-engineering; use Shape 1 or 2.

`apply(path, schema)` applies one schema object to one sub-path. Recipe 03
(`apps/03-cross-field-validation/app.schema.ts`) reuses one email schema on two fields -
that is what earns `schema()`:

```ts
const emailSchema = schema<string>((path) => {
  required(path, { message: 'Please enter your email.' });
  email(path, { message: 'Please enter a valid email address' });
  debounce(path, 250);
});

export function userSchema(path: SchemaPathTree<UserFormModel>): void {
  apply(path.email, emailSchema); // reuse #1
  apply(path.confirmEmail, emailSchema); // reuse #2
  validate(path.confirmEmail /* cross-field, see validation.md */);
}
```

`applyEach(arrayPath, itemSchema)` applies one item schema to every element of an array.
Recipe 05 (`apps/05-array-validation/app.schema.ts`) - the item schema is a **named**
`schema<Item>()`, and `applyEach` of a named item helper counts as reuse even with a
single call:

```ts
export const pizzaToppingItemSchema = schema<PizzaFormModelItem>((item) => {
  min(item.count, 0, { message: 'Count cannot be negative' });
  validate(item.count, ({ value, valueOf }) => {
    const maxCount = PIZZA_TOPPINGS_MAP[valueOf(item.id)]?.max ?? 0;
    return value() > maxCount ? { kind: 'toppingMax', message: `Max ${maxCount}` } : null;
  });
});

export function pizzaMakerSchema(path: SchemaPathTree<PizzaFormModel>): void {
  applyEach(path.toppings, pizzaToppingItemSchema);
}
```

Recipe 10 (`apps/10-dynamic-forms/app.schema.ts`) mixes both: the top-level
`applicationSchema` is a plain `SchemaFn` (Shape 2), but the per-skill item rules are a
named `schema<string>()` reused via `applyEach`, and variant rules are added with
`applyWhenValue`:

```ts
export const skillItemSchema = schema<string>((path) => {
  pattern(path, /^[A-Za-z]+$/, { message: 'Letters only. No numbers or special characters.' });
});

export function applicationSchema(path: SchemaPathTree<Application>): void {
  required(path.name, { message: 'Name is required.' });
  applyEach(path.skills, skillItemSchema);
  applyWhenValue(path.engagement, isContractEngagement, (contract) => {
    required(contract.dayRate, { message: 'Enter a day rate.' });
  });
}
```

A one-line `applyEach` callback stays inline instead of a named schema (recipe 08
tickets: `applyEach(path.tickets, (ticket) => { ... })`).

## Composing per-field `SchemaFn` groups inside one `schema<T>()`

For a rich item type, do not pile every rule into one flat callback. Split the rules
into per-field `SchemaFn<T>` groups, then call them inside a single `schema<T>()`.
Recipe 12 (`apps/12-field-metadata/app.schema.ts`):

```ts
const titleRules: SchemaFn<Bookmark> = (item) => {
  maxLength(item.title, TITLE_MAX_LENGTH, { message: $localize`:@@titleTooLong:...` });
};

const urlRules: SchemaFn<Bookmark> = (item) => {
  required(item.url, { message: $localize`:@@urlRequired:Add a link before saving.` });
  debounce(item.url, 500);
  metadata(item.url, PLATFORM, ({ value }) => platformOf(domainOf(value())));
};

const priorityRules: SchemaFn<Bookmark> = (item) => {
  /* min / max */
};
const tagRules: SchemaFn<Bookmark> = (item) => {
  /* pattern + metadata */
};

const bookmarkItemSchema = schema<Bookmark>((item) => {
  titleRules(item);
  urlRules(item);
  priorityRules(item);
  tagRules(item);
});

export function bookmarkHubSchema(path: SchemaPathTree<BookmarkCollection>): void {
  applyEach(path.bookmarks, bookmarkItemSchema);
}
```

Each group is a `SchemaFn<Bookmark>` receiving the same item path; the `schema<Bookmark>()`
just invokes them in order. This keeps one field's rules (validators + metadata) in one
readable block and keeps the item schema composable.

## File homes (do not scatter)

| File            | Holds                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| `app.schema.ts` | schemas - exported `SchemaFn`s, `schema<T>()` objects, per-field groups |
| `app.model.ts`  | types, `INITIAL_*` seeds, and type guards (`isContractEngagement`)      |
| `app.data.ts`   | const data (option lists, lookup maps, tone maps)                       |
| `app.utils.ts`  | pure non-schema helpers (`domainOf`, `keepOrder`, `patternHint`)        |

Non-trivial `SchemaFn`s live in `app.schema.ts` precisely so isolated tests can
`import` and drive them without a component.

## Do / Don't

- **Do** inline a 1-5 line one-form schema in `form()` (Shape 1).
- **Do** export a named `SchemaFn` from `app.schema.ts` for a longer one-form schema so
  tests import it (Shape 2).
- **Do** use `schema<T>()` **only** for genuine reuse - `apply` to more than one path,
  `applyEach` over an array (a named item helper counts), or a second `form()`.
- **Do** split a rich item's rules into per-field `SchemaFn<T>` groups composed inside
  one `schema<T>()` (recipe 12).
- **Don't** wrap a single-use schema in `schema()`. It adds a layer and teaches the
  wrong instinct.
- **Don't** put types, seeds, or guards in `app.schema.ts` - those belong in
  `app.model.ts`.
- **Don't** hand-roll array/nested structure. `applyEach` / `apply` navigate it for you.
