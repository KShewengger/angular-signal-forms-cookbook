# Production Patterns

The cross-cutting checklist for writing signal-forms recipe code in this cookbook.
Distilled from CLAUDE.md (sections 5, 6, 9, 10) and the real recipe apps. These are
non-negotiable house rules; match them so every recipe reads as one codebase.

---

## 1. Fields are functions

A `FieldTree` node is a path. Calling it returns the `FieldState`. Read state through
the call, never off the path.

- `form.name` is the `FieldTree` (the path). Use it to navigate: `form.bookmarks[0].url`.
- `form.name()` is the `FieldState`. Use it to read signals:
  `form.name().value()`, `.errors()`, `.touched()`, `.dirty()`, `.valid()`,
  `.invalid()`, `.metadata(TOKEN)?.()`.

```ts
protected readonly titleState = computed(() => this.field().title());
protected readonly count = computed(() => this.titleState().value().length);
```

Group and array-item states expose `errorSummary()`; leaf states expose `errors()`.
Metadata is a signal reached through the token: `state.metadata(MAX_LENGTH)?.()`.

Mutate through the state too: `field().value.set(...)`, `field().value.update(...)`,
`field().markAsTouched()`, `field().markAsDirty()`.

---

## 2. The show-invalid gate

Fields should not show errors before the user has engaged. The gate is always
`(dirty() || touched()) && invalid()`. Where it lives depends on the surface.

**Inline in a form template:** use `@let` on field state. Never bind an impure pipe.

```html
@let name = form().name(); @let nameInvalid = (name.dirty() || name.touched()) && name.invalid(); @if (nameInvalid) {
<span nbText tone="danger">{{ name.errors()[0].message }}</span>
}
```

**Inside a `ValidationErrors` component:** lift the same formula into a named
`showErrors` computed and read it as `@if (showErrors())`.

```ts
protected readonly showErrors = computed(() => {
  const state = this.field()();

  return (state.dirty() || state.touched()) && state.invalid();
});
```

```html
@if (showErrors()) {
<ul role="alert" aria-live="polite">
  @for (error of errors(); track error.kind) {
  <li>{{ error.message }}</li>
  }
</ul>
}
```

Do NOT introduce a `| isFieldInvalid` pipe. A `Field` reference is stable in identity
(it does not change when `dirty`/`touched`/`invalid` flip), so a pipe on it must be
`pure: false` to update, which re-runs on every change detection of that view and fights
OnPush. This cookbook teaches the `@let` / `computed` gate instead.

---

## 3. A multi-signal condition belongs in a named `computed()`

Any expression that reads two or more signals gets a name. It documents intent, is
testable, and keeps the template flat. The gate above (two-plus signals) is the
canonical case, but the rule is general:

```ts
protected readonly nearLimit = computed(
  () => this.count() >= this.limit() - 5 && this.count() < this.limit(),
);
protected readonly hasPriorityBounds = computed(
  () => this.priorityMin() !== undefined && this.priorityMax() !== undefined,
);
```

A single-signal read stays inline (`@if (name.invalid())`). Two or more: name it.

---

## 4. File homes

Keep each kind of code in its conventional file so recipes stay navigable and the schema
stays independently testable.

| Content                                    | File                                       |
| ------------------------------------------ | ------------------------------------------ |
| Non-trivial `SchemaFn` / `Schema`          | `app.schema.ts`                            |
| Types, `INITIAL_*` seeds, type guards      | `app.model.ts`                             |
| Constant data (options, tone maps, bounds) | `app.data.ts`                              |
| Pure helpers / mappers                     | `app.utils.ts`                             |
| Metadata tokens + resources                | `app.metadata.ts` (when a recipe has them) |

- A 1-to-5 line SchemaFn is inlined into `form(model, (path) => { ... })` in the
  component; anything larger moves to `app.schema.ts` so isolated tests import it.
- Declare a discriminated-union type guard next to its type in `app.model.ts`
  (`isImaxExperience`), never inline at each call site.
- `INITIAL_*` seeds live in `app.model.ts`/`app.data.ts`; the component clones them into
  its `signal(...)` rather than mutating the shared constant.

---

## 5. Config that varies per build goes in `environments/`

Discriminator: does the value change between dev and prod builds (or per deployment)?

- **Varies** (API endpoints, feature flags, keys): put it in Angular
  `src/environments/environment.ts` and swap it with `fileReplacements` in
  `project.json`. Recipe 12 puts the Microlink endpoint there:

  ```ts
  export const environment = {
    production: true,
    microlinkEndpoint: 'https://api.microlink.io/',
  };
  ```

  Consume it by importing `environment`, never by hard-coding the URL. Tests import the
  same `environment` and match requests against `environment.microlinkEndpoint`, so the
  value stays single-sourced.

- **Never varies** (a regex pattern, a max length, a fixed option list): keep it as a
  plain exported constant in `app.data.ts`. Do not inflate `environment` with values
  that are the same in every build.

---

## 6. `NgOptimizedImage` is for raster images only

Use `NgOptimizedImage` (`ngSrc` with explicit `width`/`height`, or `fill`) for raster
assets you control, such as the landing hero. Do **not** use it for:

- SVGs (it does not optimize them and warns).
- Tiny dynamic remote logos (a favicon-sized preview logo from an API). Render those
  with a plain `<img>`.

Give every remote raster a real width/height or a `fill` container to avoid layout
shift.

---

## 7. i18n on every visible string

- Template text: `i18n="@@stable.id"`. A literal `@` in text content must be written
  `&#64;` (Angular reads `@` as the control-flow sigil; Prettier's `angular` parser
  rejects a bare one).
- TypeScript strings (data, messages): the `$localize` tagged template with a stable id,
  `$localize\`:@@id:text\``.
- IDs are the contract. Keep them stable across edits; the build loads localize via
  `setupFiles` in tests and polyfills in the build.

---

## 8. TypeScript formatting and comments

- **Blank line between a binding and the next phase.** After a `const`/`let` binding,
  insert a blank line before the next mutation, `return`, `if`, or `expect`. This is
  applied consistently across production code and specs:

  ```ts
  protected addBookmark(): void {
    const next = { id: crypto.randomUUID(), title: '', url: '' };

    this.bookmarkForm.bookmarks().value.update((list) => [...list, next]);
  }
  ```

- **No comments in production `.ts` beyond a short "why".** Strip all explanatory
  comments and all JSDoc from non-spec `.ts`. A one-line comment is acceptable only when
  it captures a non-obvious rationale that the code cannot express. Comments are for
  `*.spec.ts` only.
- **Strictly typed even though `strict: false`.** No implicit `any`, no `any` escape
  hatch; prefer `unknown` + narrowing, discriminated unions, `as const`. Type public
  APIs explicitly. Mark injected services and non-reassigned signals `readonly`.

---

## 9. Component shape

- Standalone only; new control flow (`@if`, `@for` with `track`, `@switch`); `OnPush` /
  zoneless-friendly.
- Signal inputs/outputs (`input()`, `input.required()`, `output()`, `model()`), not the
  decorator forms. Inject with `inject()`, not constructor params.
- Model form data as a `signal`, build with `form()`, bind fields with the `FormField`
  directive (`[formField]="userForm.name"`).
- Derive UI from `computed()`; reserve `effect()` for genuine side effects. Keep heavy
  logic out of templates: bind to computeds, not method calls.
- Validation lives in the schema function passed to `form()`; use `schema()` only when
  the same `Schema` is applied to more than one path/form. A single-use wrap on the
  outer `form()` is noise.
