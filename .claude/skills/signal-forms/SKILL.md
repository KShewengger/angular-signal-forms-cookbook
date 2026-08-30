---
name: signal-forms
description: Build, validate, and test Angular Signal Forms (@angular/forms/signals, Angular v21+). Trigger for any signal-forms work - form()/schema(), built-in and custom validators, cross-field and async (validateHttp) validation, Zod / Standard Schema, array fields (applyEach), conditional logic (applyWhen/applyWhenValue, disabled/hidden/readonly), custom controls (FormValueControl), submission ([formRoot]/submit), field metadata (createMetadataKey/MetadataReducer/managed httpResource keys), and zoneless testing. Distilled from a production Nx cookbook, not the docs.
license: MIT
metadata:
  author: Kristy Mae Almuete
  version: '1.0'
---

# Angular Signal Forms

Signal Forms (`@angular/forms/signals`, Angular v21+) is the signal-native forms API:
you model the data as a `signal()`, describe the rules once in a **schema function**, and
bind fields in the template with the `FormField` directive. There is no
`ReactiveFormsModule`, no `FormBuilder`, no `FormControl`, and no `*ngIf` - this is
standalone, `inject()`, new control flow, and signals throughout.

This skill is **distilled from a real production cookbook** (13 runnable apps), so every
pattern here is one that actually ships and is tested, not a doc snippet. Read the topic
reference before writing that kind of code; the references carry the copy-pasteable code
and the traps.

## The one mental model

A field is a **function with two faces**, and there are **three parallel channels** on it:

```ts
userForm.name; // FieldTree  - bind this: [formField]="userForm.name"
userForm.name(); // FieldState - read this: .value() .valid() .errors() .touched()
```

| Channel        | Question it answers         | Read with                              |
| -------------- | --------------------------- | -------------------------------------- |
| **value**      | what did the user enter?    | `field().value()`                      |
| **validation** | is it wrong?                | `field().errors()` / `field().valid()` |
| **metadata**   | what else is true about it? | `field().metadata(key)?.()`            |

Everything else is: which validators you put in the schema, how you compose schemas, and
how you read those three channels in the template.

## Non-negotiables (apply to all Signal Forms code)

- **Fields are functions.** Never treat a field like a plain object; call it for state.
- **Standalone + signals only.** `input()`/`output()`/`model()`, `inject()`, `computed()`,
  `@if`/`@for (track)`/`@switch`. No `NgModule`, no decorators-for-IO, no legacy control flow.
- **The schema is the single source of rules.** Validators, cross-field rules, async checks,
  conditional logic, and metadata all live in the schema function passed to `form()`.
- **Show-invalid gate:** `@let` on field state inline in a form template; a named
  `showErrors` computed inside a `ValidationErrors` component. **Never** an impure
  `| isFieldInvalid` pipe (a `Field` reference is identity-stable, so the pipe needs
  `pure: false` and fights change detection). See `references/production-patterns.md`.
- **Test the schema in isolation** (`form(model, schemaFn, { injector })`, assert `errors()`)
  **and** the component (DOM). Zoneless: Act → `await fixture.whenStable()` → Assert. Never
  `detectChanges()`. See `references/testing.md`.

## Building forms

- **Start here** - modeling, `form()`, `[formField]`, the field/state duality, reading
  state, the show-invalid gate. Read [getting-started.md](references/getting-started.md).
- **Schemas** - the three shapes (inline callback / exported `SchemaFn` / a `schema<T>()`
  object for genuine reuse via `apply`/`applyEach`), composition, and where each file lives.
  Read [schemas.md](references/schemas.md).

## Validation

- **Built-in, custom, and cross-field** - `required`/`email`/`min`/`max`/`minLength`/
  `maxLength`/`pattern` with `{ message }`, custom `validate()` returning `{ kind, message }`,
  cross-field via `valueOf()`, and `errors()` vs `errorSummary()`. Read
  [validation.md](references/validation.md).
- **Async** - `validateHttp` with a pending state, verified against a mock interceptor.
  Read [async-validation.md](references/async-validation.md).
- **Zod / Standard Schema** - drive validation from a Zod v4 schema with
  `validateStandardSchema`, and swap it at runtime. Read
  [standard-schema-zod.md](references/standard-schema-zod.md).

## Structure and dynamics

- **Array fields** - `applyEach`, reusable item schemas, per-item rules, `errorSummary()`.
  Read [arrays.md](references/arrays.md).
- **Conditional logic** - `applyWhen`/`applyWhenValue`, `disabled`/`hidden`/`readonly`, and
  discriminated-union variants with contained type guards. Read
  [conditional-logic.md](references/conditional-logic.md).
- **Field metadata** - attach reactive data to fields with `createMetadataKey` /
  `createManagedMetadataKey` / `MetadataReducer`, read the keys validators publish, and go
  dynamic with function-form rules and `applyWhen`. Read
  [field-metadata.md](references/field-metadata.md).

## UI and interaction

- **Custom controls** - implement `FormValueControl` (value + state + own validation), and
  when to reach for the field-subtree container pattern instead. Read
  [custom-controls.md](references/custom-controls.md).
- **Debounce and live search** - `debounce(path, ms)` (View→model only), feeding a resource.
  Read [debounce-and-async-ui.md](references/debounce-and-async-ui.md).
- **Submission** - `[formRoot]`, `submit()` / submission actions, and routing server errors
  back onto the fields. Read [submission.md](references/submission.md).

## Quality

- **Testing** - the isolated-schema + component-DOM split, zoneless patterns, interceptors,
  fake timers for debounce, and the sharp edges (`NG0950`, pending `httpResource`). Read
  [testing.md](references/testing.md).
- **Production patterns** - the cross-cutting checklist: file homes, the `showErrors`
  computed, config-in-`environments`, `NgOptimizedImage` scope, i18n, and formatting. Read
  [production-patterns.md](references/production-patterns.md).

## Grounding - which app teaches what

Each topic is lifted from a specific, runnable recipe. When a reference cites a recipe, that
is the app to read for the full, working example:

| API / concept                               | Recipe                    |
| ------------------------------------------- | ------------------------- |
| `form()`, `[formField]`, field state        | 01 basic-form             |
| built-in validators + messages              | 02 built-in-validations   |
| cross-field `validate` + `valueOf`          | 03 cross-field-validation |
| `validateHttp` + pending                    | 04 async-validation       |
| `applyEach` + per-item rules                | 05 array-validation       |
| `FormValueControl`, `disabled`/`hidden`     | 06 custom-control         |
| `debounce` + live `rxResource` search       | 07 debounce-input         |
| `applyWhenValue`, `submit`, `[formRoot]`    | 08 conditional-validation |
| server errors back to fields                | 09 form-submission        |
| union variants + type guards                | 10 dynamic-forms          |
| `validateStandardSchema` (Zod)              | 11 zod-schema             |
| `metadata`, `MetadataReducer`, managed keys | 12 field-metadata         |
