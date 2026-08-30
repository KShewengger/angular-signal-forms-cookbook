# Field Metadata

Metadata is the third channel on a signal-forms field. A field carries three
parallel streams, and you must not confuse them:

- **Value** - the data the user edits (`field().value()`), driven by `[formField]`.
- **Validation** - validators publish **errors** (`field().errors()`), read for
  correctness gating.
- **Metadata** - rules publish **values** (`field().metadata(KEY)?.()`), read to
  drive presentation and behavior.

Metadata is reactive, typed, per-field data that lives on the field alongside its
value and errors. Reach for it when a field needs a derived fact that is not a
value the user types and not an error: a platform badge inferred from a URL, a
character ceiling, a live link preview, a status hint. Do **not** overload the
value signal or invent a parallel `computed()` map keyed by field id when the fact
belongs to a specific field - attach it as metadata so it travels with the field
(including through array add/remove and `applyEach`).

Everything below is grounded in `apps/12-field-metadata` (Bookmark Hub). Read
`app.metadata.ts` (key definitions), `app.schema.ts` (contribution rules),
`bookmark-card/bookmark-card.ts` (reads), and `metadata-hints/metadata-hints.ts`
(field-aware presentational component) alongside this doc.

---

## Mental model: rules contribute, a reducer merges, you read one value

A metadata **key** is the identity you read from. Multiple `metadata(path, KEY, fn)`
rules in the schema **contribute** to that key. The key's **reducer** merges every
contribution into the single value the component reads. This is the whole model:

```
metadata(url, HELP, fn1)  ─┐
metadata(url, HELP, fn2)  ─┤─► HELP's reducer (list) ─► field().metadata(HELP)?.()  ─► string[]
metadata(url, HELP, fn3)  ─┘
```

Recipe 12 contributes to `HELP` twice on `item.url` (homepage-vs-deep-link, then
unrecognized-site), and the `list` reducer collects both non-undefined results into
the array the card renders. You never merge by hand - you pick the reducer when you
create the key, and the framework folds the contributions.

---

## Creating keys

There are three constructors. Pick by how contributions should combine.

### `createMetadataKey<T>()` - last write wins (`override`)

The default reducer is `override`: the last rule to contribute wins, earlier
contributions are discarded. Use it for a single-source fact.

```ts
// app.metadata.ts
export const PLATFORM = createMetadataKey<Platform | undefined>();
export const PIN_NOTE = createMetadataKey<string | undefined>();
```

`PLATFORM` has exactly one contributor (`item.url`), so override is the honest
choice - there is nothing to merge.

### `createMetadataKey(reducer)` - custom merge

Pass a `MetadataReducer<TWrite, TAcc>` object - `{ getInitial, reduce }` - when
contributions must combine with domain logic. Recipe 12's `STATUS` keeps the
**highest-severity** hint across all contributions:

```ts
// app.metadata.ts
const SEVERITY_RANK: Record<Severity, number> = { ok: 0, notice: 1, warning: 2 };

const severityReducer: MetadataReducer<StatusHint, StatusHint> = {
  getInitial: () => STATUS_HINTS.ready,
  reduce: (acc, item) => (SEVERITY_RANK[item.level] > SEVERITY_RANK[acc.level] ? item : acc),
};

export const STATUS = createMetadataKey<StatusHint, StatusHint>(severityReducer);
```

Two rules contribute to `STATUS` (needs-link, needs-title); the reducer surfaces the
more severe of the two so the card shows the most pressing hint. `getInitial` is the
accumulator seed used when no rule contributes.

### `createMetadataKey(MetadataReducer.list<T>())` - collect into an array

`MetadataReducer.list<T>()` gathers every contribution into a `T[]`, **skipping
`undefined`**. Return `undefined` from a rule to opt out of contributing.

```ts
// app.metadata.ts
export const HELP = createMetadataKey(MetadataReducer.list<string>());
export const TAG_HINT = createMetadataKey(MetadataReducer.list<string>());
```

`HELP`'s two rules each return a string or `undefined`; the card reads `string[]`.

### `createManagedMetadataKey(factory)` - a lifecycle-bound resource per field

Use this when the metadata is **async** and must be created, re-fetched, and torn
down per field. The factory receives the field state and the data the rule passes,
and returns a resource that Angular owns: it re-runs when its reactive reads change
and is disposed when the field is removed.

```ts
// app.metadata.ts
export const URL_PREVIEW = createManagedMetadataKey((_state, url: Signal<string | undefined>) =>
  httpResource<LinkPreview>(
    () => {
      const value = (url() ?? '').trim();
      const domain = domainOf(value);
      return domain ? { url: environment.microlinkEndpoint, params: { url: withProtocol(value) } } : undefined;
    },
    { parse: (raw) => toLinkPreview(raw as MicrolinkResponse) },
  ),
);
```

The rule that feeds it passes the url signal through:

```ts
// app.schema.ts, inside urlRules
metadata(item.url, URL_PREVIEW, ({ value }) => value());
```

Because the request builder reads `url()`, editing the URL re-fetches against
Microlink; removing the bookmark disposes the resource. The component reads the
resource object itself (not a value snapshot) so it can render loading / error /
value states - see below.

---

## Reading metadata in the component

Read with `field().metadata(KEY)?.()`. The optional chain matters: a key with no
contribution returns `undefined` rather than a signal.

```ts
// bookmark-card.ts
protected readonly status = computed(() => this.fieldState().metadata(STATUS)?.());
protected readonly platform = computed(() => this.urlState().metadata(PLATFORM)?.());
protected readonly pinNote = computed(() => this.fieldState().metadata(PIN_NOTE)?.());

// managed key: read the resource object, do NOT call it as a signal
protected readonly preview = computed(() => this.urlState().metadata(URL_PREVIEW));
```

For a **reducer** key the stored metadata is itself a `Signal<TAcc>`, so
`metadata(KEY)?.()` unwraps that inner signal and hands you `TAcc`. That is why the
exact key type carries **three** type args - `MetadataKey<Signal<TAcc>, TWrite, TAcc>`

- visible in the presentational component:

```ts
// metadata-hints.ts
type HintKey = MetadataKey<Signal<string[]>, string | undefined, string[]>;
```

Read: `TStored = Signal<string[]>`, `TWrite = string | undefined` (what a rule
returns), `TAcc = string[]` (what you read after the reducer runs).

For a **presence** check with no value, use the native boolean:

```ts
field().hasMetadata(REQUIRED); // boolean, no unwrap
```

Coalesce to a safe default when a downstream consumer expects a concrete value:

```ts
const hints = field().metadata(this.key())?.() ?? [];
```

---

## Built-in metadata published by validators

Validators publish metadata **and** errors. The error tells you the field is
invalid; the metadata hands you the constraint's operand so the UI can show the
rule before it is broken. Recipe 12 reads four:

| Validator         | Metadata key | Reads as                | Drives                         |
| ----------------- | ------------ | ----------------------- | ------------------------------ |
| `maxLength(f, n)` | `MAX_LENGTH` | the limit `n`           | the `17 / 40` title counter    |
| `min(f, n)`       | `MIN_NUMBER` | the minimum             | the `1 to 5` priority bound    |
| `max(f, n)`       | `MAX_NUMBER` | the maximum             | the priority bound's upper end |
| `pattern(f, re)`  | `PATTERN`    | the `RegExp` operand(s) | the tag format hint            |
| `required(f)`     | `REQUIRED`   | presence                | required affordances           |

```ts
// bookmark-card.ts - the character counter
protected readonly count = computed(() => this.titleState().value().length);
protected readonly limit = computed(
  () => this.titleState().metadata(MAX_LENGTH)?.() ?? TITLE_MAX_LENGTH,
);
```

```ts
// bookmark-card.ts - the "1 to 5" priority bounds
protected readonly priorityMin = computed(() => this.priorityState().metadata(MIN_NUMBER)?.());
protected readonly priorityMax = computed(() => this.priorityState().metadata(MAX_NUMBER)?.());
protected readonly hasPriorityBounds = computed(
  () => this.priorityMin() !== undefined && this.priorityMax() !== undefined,
);
```

`PATTERN` is a reducer key that reads as an array - the tag rule reads its own
field's `PATTERN` metadata and maps the first expression to a human hint, feeding
`TAG_HINT`:

```ts
// app.schema.ts, inside tagRules
pattern(item.tag, TAG_PATTERN, { message: $localize`:@@tagPattern:...` });

metadata(item.tag, TAG_HINT, ({ state }) => {
  const [expression] = state.metadata(PATTERN)?.() ?? [];
  return expression ? patternHint(expression) : undefined;
});
```

**Do not** hardcode `40`, `1`, `5`, or the regex in the template. Read the operand
from validator metadata so the constraint and the label can never drift.

---

## The built-in reducers on `MetadataReducer`

| Reducer      | Accumulator starts at | Merge of a contribution `x`     | Reads as  |
| ------------ | --------------------- | ------------------------------- | --------- | --- | --------- |
| `list<T>()`  | `[]`                  | append `x` if `x !== undefined` | `T[]`     |
| `min()`      | `+Infinity`           | `Math.min(acc, x)`              | `number`  |
| `max()`      | `-Infinity`           | `Math.max(acc, x)`              | `number`  |
| `or()`       | `false`               | `acc                            |           | x`  | `boolean` |
| `and()`      | `true`                | `acc && x`                      | `boolean` |
| `override()` | `undefined`           | `x` (last write wins)           | `T`       |

`override()` is the default when you call `createMetadataKey<T>()` with no argument.
`MAX_LENGTH`/`MIN_NUMBER`/`MAX_NUMBER` are backed by the numeric reducers, which is
why several `maxLength`/`min`/`max` calls on one path collapse to a single tight
bound rather than fighting.

---

## Dynamic metadata: a value re-computes when its rule reads a signal

A metadata rule is reactive. If its body reads a field signal, the metadata
recomputes when that signal changes - exactly like a `computed`. Recipe 12 makes the
priority ceiling react to the `pinned` checkbox:

```ts
// app.schema.ts, inside priorityRules
max(item.priority, ({ valueOf }) => (valueOf(item.pinned) ? PRIORITY_PINNED_MAX : PRIORITY_MAX), { message: $localize`:@@priorityMax:Priority is above the allowed maximum.` });
```

Because the `max` operand reads `valueOf(item.pinned)`, `MAX_NUMBER` flips from `5`
to `10` the instant the box is checked, and the `1 to 5` label re-renders to
`1 to 10` with no extra wiring. A rule whose body returns a constant looks static -
that is fine and expected for keys like `PLATFORM` where the source is a single
computed fact, not a live toggle.

---

## Metadata inside `applyWhen`

Contribute conditionally by placing the `metadata` call inside `applyWhen`. The
contribution exists only while the predicate holds:

```ts
// app.schema.ts, inside pinnedRules
applyWhen(
  item,
  ({ value }) => value().pinned,
  (pinnedItem) => {
    metadata(pinnedItem, PIN_NOTE, () => $localize`:@@pinNote:Pinned: shown first, priority ceiling raised to ${PRIORITY_PINNED_MAX}:max:.`);
  },
);
```

When `pinned` is false, `PIN_NOTE` has no contributor, so `metadata(PIN_NOTE)?.()`
is `undefined` and the card renders no note. Check the box and the note appears.
Prefer this over an unconditional rule that returns `undefined` when you want the
metadata to genuinely not exist off-condition.

---

## Recipe 12 key recap

| Key           | Kind                         | Reads as                | Drives                                    |
| ------------- | ---------------------------- | ----------------------- | ----------------------------------------- |
| `MAX_LENGTH`  | built-in (`maxLength`)       | `number`                | title `count / limit` counter             |
| `MIN_NUMBER`  | built-in (`min`)             | `number`                | priority lower bound                      |
| `MAX_NUMBER`  | built-in (`max`, dynamic)    | `number`                | priority upper bound (5 → 10 when pinned) |
| `PATTERN`     | built-in (`pattern`)         | `RegExp[]`              | source for `TAG_HINT`                     |
| `PLATFORM`    | `createMetadataKey` override | `Platform \| undefined` | platform badge on the preview             |
| `STATUS`      | custom severity reducer      | `StatusHint`            | the status badge (highest severity wins)  |
| `HELP`        | `list<string>`               | `string[]`              | URL help hints                            |
| `TAG_HINT`    | `list<string>`               | `string[]`              | tag format hint                           |
| `PIN_NOTE`    | override, via `applyWhen`    | `string \| undefined`   | pinned note (present only when pinned)    |
| `URL_PREVIEW` | managed `httpResource`       | resource object         | link preview (loading / error / value)    |

The managed `URL_PREVIEW` is read as the resource itself so the template can branch
on its lifecycle:

```html
<!-- bookmark-card.html -->
@let previewRef = preview(); @if (previewRef?.isLoading()) { ...spinner... } @else if (previewRef?.error()) { ...error... } @else { @if (previewRef?.value(); as data) { ...title, domain, image... } }
```

---

## Presentational vs field-aware components

`MetadataHints` is **field-aware**: it takes a field and a metadata key as inputs
and reads the metadata itself. It stays generic by taking the key as an input rather
than importing `HELP`/`TAG_HINT` - the same component renders both hint lists.

```ts
// metadata-hints.ts
type HintKey = MetadataKey<Signal<string[]>, string | undefined, string[]>;

export class MetadataHints {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<HintKey>();

  protected readonly hints = computed(() => {
    const field = this.field();
    return field().metadata(this.key())?.() ?? [];
  });
}
```

```html
<!-- bookmark-card.html: same component, two keys -->
<app-metadata-hints [field]="field().url" [key]="helpKey" />
<app-metadata-hints [field]="field().tag" [key]="tagHintKey" />
```

Keep the **domain mapping** out of this component. The regex-to-words translation
lives in a pure util (`patternHint` in `app.utils.ts`, backed by `PATTERN_HINTS` in
`app.data.ts`) and is applied in the schema, not baked into the shared view. The
component only reads and renders; the schema decides what the hints say. Contrast
with a purely **presentational** component (like the recipe's `ValidationErrors`,
which takes already-resolved `errors` and a `visible` gate) that reads no metadata at
all - the parent owns the read.

---

## Do / Don't

- **Do** attach a per-field derived fact as metadata, not as a value or a side map.
  Metadata travels with the field through `applyEach` and array add/remove.
- **Do** read validator operands (`MAX_LENGTH`, `MIN_NUMBER`, `MAX_NUMBER`,
  `PATTERN`) from metadata instead of hardcoding the numbers/regex in the template -
  the constraint and its label then cannot drift.
- **Do** pick the reducer that matches how contributions combine: `list` to collect,
  `min`/`max` for tightest bound, a custom reducer for domain merges like severity,
  `override` for a single source.
- **Do** use `createManagedMetadataKey` for anything async/lifecycle-bound; read the
  resource object and branch on `isLoading()` / `error()` / `value()`.
- **Do** return `undefined` from a `list` rule (or scope the rule inside `applyWhen`)
  to opt out of contributing.
- **Don't** call a managed key as a signal (`metadata(URL_PREVIEW)?.()`) - you want
  the resource object, so read `metadata(URL_PREVIEW)`.
- **Don't** forget the optional chain: `metadata(KEY)?.()` is `undefined` when no
  rule contributed; coalesce (`?? []`, `?? DEFAULT`) where a value is required.
- **Don't** confuse the type args: a reducer key stores `Signal<TAcc>`, so its type
  is `MetadataKey<Signal<TAcc>, TWrite, TAcc>` and `metadata(KEY)?.()` unwraps to
  `TAcc`.
- **Don't** bake domain mapping into a shared field-aware component; keep it in a
  pure util or the schema and pass the key in as an input.
- **Don't** reach for `effect()` to sync metadata into other state - a metadata rule
  is already reactive; read it in a `computed`.
