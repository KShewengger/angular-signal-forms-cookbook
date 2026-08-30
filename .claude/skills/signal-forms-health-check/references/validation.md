# Validation

Validators are functions from `@angular/forms/signals` that you attach to a field inside
a schema. Each one adds an error to that field when its rule fails. Built-in validators
cover the common cases; `validate()` covers custom and cross-field rules.

Grounded in recipe 02 (`apps/02-built-in-validations`, built-in validators) and recipe
03 (`apps/03-cross-field-validation`, cross-field).

## Built-in validators

Attach them to a path inside a `SchemaFn`. Each takes the field path, its rule argument
(where applicable), and an options object carrying a human `message`. Recipe 02
(`app.schema.ts`):

```ts
import { email, maxLength, min, minLength, pattern, required, SchemaPathTree } from '@angular/forms/signals';

export function registrationSchema(path: SchemaPathTree<RegistrationFormModel>): void {
  required(path.username, { message: 'Please enter a username.' });
  minLength(path.username, 5, { message: 'Username must be at least 5 characters long.' });
  maxLength(path.username, 20, { message: 'Username cannot exceed 20 characters.' });
  pattern(path.username, /^USER-\d{3}$/, { message: 'Username must follow the format USER-123.' });

  required(path.email, { message: 'Please enter your email address.' });
  email(path.email, { message: 'Please enter a valid email address.' });

  required(path.age, { message: 'Please enter your age.' });
  min(path.age, 10, { message: 'You must be at least 10 years old.' });

  required(path.role, { message: 'Please select a role.' });
}
```

| Validator                    | Fails when                   |
| ---------------------------- | ---------------------------- |
| `required(path, opts)`       | value is empty / null        |
| `email(path, opts)`          | value is not a valid email   |
| `min(path, n, opts)`         | numeric value `< n`          |
| `max(path, n, opts)`         | numeric value `> n`          |
| `minLength(path, n, opts)`   | string/array length `< n`    |
| `maxLength(path, n, opts)`   | string/array length `> n`    |
| `pattern(path, regex, opts)` | value does not match `regex` |

`min`/`max` also accept a **reactive** bound: pass a function of the field context
instead of a constant. Recipe 12 raises the priority ceiling when a bookmark is pinned:

```ts
max(item.priority, ({ valueOf }) => (valueOf(item.pinned) ? PRIORITY_PINNED_MAX : PRIORITY_MAX), {
  message: $localize`:@@priorityMax:Priority is above the allowed maximum.`,
});
```

Give every validator a `message`. Wrap user-facing strings in `$localize` where the
recipe is internationalized (recipe 12 does; recipes 02/03/10 use plain strings).

Every built-in also accepts a `when` in its options (`required(path.state, { when:
({ valueOf }) => valueOf(path.country) === 'US', message: '...' })`) so the rule only
runs while the predicate holds. The cookbook expresses the same conditionality by
wrapping rules in `applyWhen` / `applyWhenValue` instead (see `conditional-logic.md`),
which reads better when several rules share one gate.

**Validation is not native constraint validation.** Signal Forms runs these rules
itself and does not defer to the browser's built-in constraint validation. It still
reflects `required` / `min` / `max` / etc. onto the native element as attributes for
accessibility and input behavior, but those attributes do not drive the errors. All
rules on a field run on every value change - validation does **not** short-circuit
after the first failure, so `errors()` can carry several entries at once.

## Every error carries a stable `kind` and a human `message`

An error is `{ kind, message }`. `kind` is a stable machine tag (`'required'`,
`'email'`, `'min'`, `'pattern'`, or your custom string); `message` is what you render.

- Assert **kind and message** in tests when the schema defines a message.
- Assert **kind alone** only when production has no custom message (e.g. a bare
  `required(path.name)` in recipe 01).

## Cross-field validation with `validate()`

Built-ins see one field. For a rule that depends on another field, use `validate(path,
fn)`. The callback receives a **field context** and returns an error object when the rule
fails, or `null` when it passes. The context surface (same object every logic function
receives, see `conditional-logic.md`):

| Context member      | Reads                                             | Cookbook  |
| ------------------- | ------------------------------------------------- | --------- |
| `value()`           | this field's current value (a signal)             | yes       |
| `valueOf(path)`     | any other field's raw value                       | yes       |
| `state`             | this field's `FieldState` (touched/dirty/errors)  | yes (12)  |
| `stateOf(path)`     | another field's `FieldState`                      | docs-only |
| `fieldTreeOf(path)` | another field's `FieldTree` (programmatic access) | docs-only |

Reach for `valueOf` for a plain comparison; reach for `stateOf` when the rule should
wait on another field's interaction state (for example, only flag a mismatch once the
first field is `touched()`):

```ts
validate(path.confirmPassword, ({ value, valueOf, stateOf }) => {
  if (!stateOf(path.password).touched()) return null;
  if (value() !== valueOf(path.password)) {
    return { kind: 'passwordMismatch', message: 'Passwords do not match.' };
  }
  return null;
});
```

The cookbook guards on `value()` truthiness instead (recipe 03 below); `stateOf` is a
docs-shown alternative the cookbook does not currently use.

Recipe 03 (`app.schema.ts`) - confirm-email must match email:

```ts
validate(path.confirmEmail, ({ value, valueOf }) => {
  const email = valueOf(path.email);

  if (!email || !value()) return null;

  if (email.trim().toLowerCase() !== value().trim().toLowerCase()) {
    return { kind: 'emailMismatch', message: 'Email addresses do not match.' };
  }

  return null;
});
```

Return your own `kind` so tests and UI can target it. Guard the trivial case first
(`if (!email || !value()) return null`) so the mismatch error does not fire before both
fields have input. Recipe 05 uses the same `validate` shape against a lookup for a
per-item ceiling (`{ kind: 'toppingMax', message: \`Max ${maxCount}\` }`), reading a
sibling with `valueOf(item.id)`.

Attach the cross-field rule to the field that should **show** the error (here
`confirmEmail`), so the message renders under the second input, not the first.

## Tree-level validation with `validateTree()` (docs-only)

`validate()` attaches to one field, so it can only surface the error on that field.
When a rule spans a **subtree** and needs to route errors to whichever children are
at fault (for example, flagging every duplicate in a list), the docs use
`validateTree(path, fn)`. The callback runs at the group/array level and returns an
**array** of error objects; each may carry a `fieldTree` back-reference that targets
the error to a specific child instead of the parent:

```ts
validateTree(path.rows, ({ value, fieldTreeOf }) => {
  const errors = duplicateEntries(value()).map(({ val, fieldTree }) => ({
    kind: 'duplicateInRow',
    message: `${val} already appears in this row`,
    fieldTree,
  }));
  return errors.length > 0 ? errors : null;
});
```

The cookbook does not use `validateTree` today - recipes 03/05 attach ordinary
`validate()` to the single field that should show the error, and array-item rules go
through `applyEach` (see `arrays.md`). Reach for `validateTree` only when one rule must
fan an error out to more than one child at once.

## Reading errors: leaf `errors()` vs group/array-item `errorSummary()`

- A **leaf** field exposes its own errors via `field().errors()`.
- A **group or array-item** field aggregates its descendants' errors via
  `field().errorSummary()`.

Both are gated the same way in the shared `ValidationErrors` component:
`(state.dirty() || state.touched()) && state.invalid()`.

Recipe 03 binds a leaf field and reads `errors()`:

```ts
// validation-errors.ts (recipe 03) - leaf field
protected readonly errors = computed(() => this.field().errors());
```

Recipe 05 binds an array-item field and reads `errorSummary()` (same component shape,
one line different):

```ts
// validation-errors.ts (recipe 05) - array item
protected readonly errors = computed(() => this.field().errorSummary());
```

Template is identical; only the source signal differs:

```html
@if (showErrors()) {
<ul role="alert" [id]="messageId()">
  @for (error of errors(); track error.kind) {
  <li><span nbText tone="danger">{{ error.message }}</span></li>
  }
</ul>
}
```

`errorSummary()` entries also carry a `fieldTree()` back-reference, which submit
handlers use to focus the first offender:
`field().errorSummary()[0]?.fieldTree().focusBoundControl()` (recipes 09/10/11).

## Do / Don't

- **Do** give every built-in validator a `{ message }` (via `$localize` in i18n
  recipes).
- **Do** use `validate(path, ({ value, valueOf }) => ...)` for cross-field rules,
  returning `{ kind, message }` or `null`.
- **Do** attach a cross-field rule to the field whose UI should surface the error.
- **Do** guard the empty/partial state (`return null`) before comparing, so errors do
  not fire prematurely.
- **Do** read `errors()` on leaf fields, `errorSummary()` on group / array-item fields.
- **Do** reach for `validateTree` (not repeated `validate`) only when one rule must
  route errors to several children via `fieldTree`; otherwise attach `validate` to the
  single field that shows the error.
- **Don't** invent a new `kind` per message when a built-in already sets one; keep
  `kind` stable for tests.
- **Don't** show errors ungated. Always gate on `(dirty || touched) && invalid` (see
  `getting-started.md`).
- **Don't** hand-roll async or schema-derived validation here - `validateHttp` lives in
  `async-validation.md`, `validateStandardSchema` (Zod/Valibot) in `standard-schema-zod.md`.
