---
name: signal-forms-health-check
description: Audit Angular Signal Forms code (@angular/forms/signals, Angular v21+) against a curated production playbook, and use as the reference for building it. Invoke with NO argument to review the current branch's changed signal-forms files; pass a file or folder PATH to audit only that, in isolation. Covers form()/schema(), validators, cross-field and async validation, Zod, arrays, conditional logic, custom controls, submission, field metadata, and zoneless testing. A custom skill distilled from a production Nx cookbook and cross-checked against angular.dev - NOT an official Angular skill.
license: MIT
metadata:
  author: Kristy Mae Almuete
  version: '2.0'
---

# Signal Forms Health Check

A **custom, cookbook-grown reviewer** for Angular Signal Forms (`@angular/forms/signals`,
Angular v21+). This is not an official Angular skill: the rules are distilled from 13
runnable, tested recipes and cross-checked against `angular.dev/guide/forms/signals`.

It works two ways off **one rubric** (the playbook in `references/`):

- **Audit** - review signal-forms code against the playbook, scoped by an optional path.
  This is what to do when the skill is invoked.
- **Reference** - the same `references/*` are the how-to for writing signal forms in the
  first place. When building, read the topic file before writing that kind of code.

## Scope - what gets audited

- **No argument** -> the **current branch's changed files** (vs `main`) that touch signal
  forms.
- **A path argument** (a file or a folder) -> **only that path**, in isolation. Ignore
  everything else.

Resolve scope first:

```bash
# with an argument: audit exactly that file/folder (recurse into a folder)
# with no argument: the branch's changed, signal-forms-touching files
git fetch origin main --quiet 2>/dev/null
BASE="$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD main)"
git diff --name-only "$BASE"...HEAD; git status --porcelain
```

A file is **in scope for signal-forms review** if it imports from `@angular/forms/signals`,
is an `app.schema.ts` / `app.model.ts` / metadata / custom-control file, is a template with
`[formField]` / `[formRoot]`, or is a `*.spec.ts` that builds a `form()`. Skip anything
unrelated even if it changed.

## How to audit

1. **Resolve scope** (above). If nothing is in scope, say so and stop.
2. **Read every in-scope file end to end.** No sampling.
3. For each file, **map it to the rubric**: which references apply (a schema? a validator?
   a custom control? metadata? a test?), and read those as the checklist.
4. **Verify, do not inherit.** Check each candidate finding against the real code and the
   reference rule; quote the evidence. The docs are the API authority - if code contradicts
   a reference, confirm against `angular.dev` before flagging.
5. **Report** findings ranked **P0** (broken / wrong API / build-red), **P1** (convention
   violation), **P2** (polish), each citing the reference rule it breaks and the exact fix.
   State a clean "nothing found" line per dimension with no findings.
6. **Apply** P0 + P1 (ask before P2), then verify with `nx affected -t lint test build`.

## The rubric (reference index)

Each reference is both an audit dimension and a build guide:

| Dimension                                                                                                    | Read                                                            |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Modeling, `form()`, `[formField]`, field/state duality, full field-state surface                             | [getting-started.md](references/getting-started.md)             |
| Schema shapes (inline / `SchemaFn` / `schema<T>()`), `apply`/`applyEach`, model design                       | [schemas.md](references/schemas.md)                             |
| Built-in + custom + cross-field validation, `validateTree`, error `kind`/`message`                           | [validation.md](references/validation.md)                       |
| Async `validateHttp` / `validateAsync`, pending, latest-wins                                                 | [async-validation.md](references/async-validation.md)           |
| Zod / Standard Schema (`validateStandardSchema`)                                                             | [standard-schema-zod.md](references/standard-schema-zod.md)     |
| Array fields, `applyEach`, `errorSummary()`                                                                  | [arrays.md](references/arrays.md)                               |
| Conditional logic: `applyWhen`/`applyWhenValue`, `disabled`/`hidden`/`readonly`, variants, JSON-driven forms | [conditional-logic.md](references/conditional-logic.md)         |
| Field metadata: `createMetadataKey`/`MetadataReducer`/managed keys, dynamic + `applyWhen`                    | [field-metadata.md](references/field-metadata.md)               |
| Custom controls: `FormValueControl` / `FormCheckboxControl`                                                  | [custom-controls.md](references/custom-controls.md)             |
| `debounce` (View->model) + live-search resource                                                              | [debounce-and-async-ui.md](references/debounce-and-async-ui.md) |
| Submission: `[formRoot]`, `submit()` -> `Promise<boolean>`, server errors back to fields                     | [submission.md](references/submission.md)                       |
| Zoneless testing: isolated schema + component DOM, `whenStable()`, injection context                         | [testing.md](references/testing.md)                             |
| Cross-cutting production checklist                                                                           | [production-patterns.md](references/production-patterns.md)     |

## Core rules the audit enforces

- **Fields are functions.** `form.name` (FieldTree) is for binding; `form.name()` (FieldState)
  is for reading. Never treat a field like a plain object.
- **`valid()` is not `!invalid()`.** A pending async validator leaves both `false`; gate a
  submit on `valid()` (or `!invalid() && !pending()`), never `!invalid()` alone.
- **Standalone + signals only.** `input()`/`output()`/`model()`, `inject()`, `computed()`,
  `@if`/`@for (track)`/`@switch`. No `NgModule`, no IO decorators, no legacy control flow.
- **The schema is the single source of rules** (validators, cross-field, async, conditional
  logic, metadata) - not the template.
- **Show-invalid gate:** `@let` on field state inline in a form template; a named
  `showErrors` computed inside a `ValidationErrors` component. Never an impure
  `| isFieldInvalid` pipe.
- **Test isolated + DOM.** Build the schema with `form(model, schemaFn, { injector })`
  (it throws without an injection context) and assert `errors()`; render the component only
  for what the template shows. Zoneless: Act -> `await fixture.whenStable()` -> Assert. Never
  `detectChanges()`.
- **Config that varies per build -> `environments/`; static -> a constant.** No `any`. No
  em dashes in copy. i18n every visible string.

## The one mental model

A field is a function with two faces, and there are three parallel channels on it:

```ts
userForm.name; // FieldTree  - bind: [formField]="userForm.name"
userForm.name(); // FieldState - read: .value() .valid() .errors() .touched() .pending()
```

| Channel        | Question                    | Read with                              |
| -------------- | --------------------------- | -------------------------------------- |
| **value**      | what did the user enter?    | `field().value()`                      |
| **validation** | is it wrong?                | `field().errors()` / `field().valid()` |
| **metadata**   | what else is true about it? | `field().metadata(key)?.()`            |

## Honest scope note

Signal forms are Angular's forward-looking, signal-native forms API (v21+, still evolving).
Angular's own overview says **reactive forms remain the choice when you need
production-stability guarantees**. This skill targets new signal-forms code and does not
cover reactive or template-driven forms; treat "production-grade" as "the best current
signal-forms practice," not a stability guarantee from the framework.

## Grounding - which app teaches what

Every rule here is distilled from a runnable recipe in the cookbook repo. **If you
downloaded this skill on its own (no clone), you don't need the source checked out to use
it** - each recipe's **README** explains its concept, and the full source sits alongside it
in the same `apps/NN-name/` folder on GitHub. Start from the recipe README:

| API / concept                               | Recipe README                                                                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `form()`, `[formField]`, field state        | [01 basic-form](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/01-basic-form/README.md)                         |
| built-in validators + messages              | [02 built-in-validations](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/02-built-in-validations/README.md)     |
| cross-field `validate` + `valueOf`          | [03 cross-field-validation](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/03-cross-field-validation/README.md) |
| `validateHttp` + pending                    | [04 async-validation](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/04-async-validation/README.md)             |
| `applyEach` + per-item rules                | [05 array-validation](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/05-array-validation/README.md)             |
| `FormValueControl`, `disabled`/`hidden`     | [06 custom-control](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/06-custom-control/README.md)                 |
| `debounce` + live `rxResource` search       | [07 debounce-input](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/07-debounce-input/README.md)                 |
| `applyWhenValue`, `submit`, `[formRoot]`    | [08 conditional-validation](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/08-conditional-validation/README.md) |
| server errors back to fields                | [09 form-submission](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/09-form-submission/README.md)               |
| union variants + type guards                | [10 dynamic-forms](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/10-dynamic-forms/README.md)                   |
| `validateStandardSchema` (Zod)              | [11 zod-schema](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/11-zod-schema/README.md)                         |
| `metadata`, `MetadataReducer`, managed keys | [12 field-metadata](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/12-field-metadata/README.md)                 |
