# Form Submission in Signal Forms

The submission flow: mark the `<form>` as the form root, run an async action through
`submit`, expose submitting state to the template, and route the server's errors back
onto the fields that caused them. Grounded in recipe
[`09-form-submission`](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/09-form-submission/README.md)
(a graded pop quiz) and
[`08-conditional-validation`](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/08-conditional-validation/README.md)
(a cinema booking).

---

## `[formRoot]` - bind the native form element

Put `[formRoot]` on the `<form>` element and point it at your `form()`. This wires
native submit and lets the framework manage focus and submit state. From `09`
`app.html`:

```html
<form class="card ..." [formRoot]="answerForm" [class.card--shake]="shaking()">
  <!-- ...fields... -->
  <button nbButton type="submit" [disabled]="submitting()">@if (submitting()) { <span i18n="@@submitting">Checking…</span> } @else { <span i18n="@@submit">Submit</span> }</button>
</form>
```

Import `FormRoot` (alongside `FormField`) in the component. A `type="submit"` button
inside the form triggers the configured submission action; no `(click)` handler.
`FormRoot` sets `novalidate` on the element (so the browser's native bubbles never
fire) and intercepts the native submit event to run your `submission` action instead
of navigating.

---

## Two ways to run the action

### 1. `submit(form, action)` - imperative, one-off

Call `submit(form, action)` from a handler when you want to trigger submission
yourself. From `08` `app.ts`:

```ts
protected book(): void {
  submit(this.bookingForm, async () => {
    this.booked.set(true);
  });
}
```

`submit` drives the full lifecycle in order: it marks interactive fields **touched**
(so errors reveal), checks **validation** (halting if any rule fails), runs the
**action** with `submitting()` true, then **handles the result** by routing any
returned errors back onto fields. The action is `async`, and the form's
`submitting()` flips true for its duration.

`submit` returns `Promise<boolean>`: `true` on success, `false` when validation
fails or the action returns errors. It also **guards against double submits** - while
a submission is in flight, a further `submit(...)` call returns `false` immediately
rather than launching a second action, so you rarely need your own re-entrancy guard
around `submit` itself (guard sibling mutations separately, see below).

### 2. `submission` config on `form()` - declarative, tied to `[formRoot]`

Configure the action once when building the form and let `[formRoot]`'s native submit
drive it. From `09` `app.ts`:

```ts
protected readonly answerForm = form(
  this.answerModel,
  (path) => {
    required(path.answer, { message: 'Answer this question before submitting.' });
  },
  {
    submission: {
      action: (field) => this.gradeSubmission(field),
      onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      ignoreValidators: 'none',
    },
  },
);
```

- `action(field)` receives the form's `FieldTree` (and an optional second `detail`
  argument) and does the async work.
- `onInvalid(field)` runs when submit is attempted but validation fails, after fields
  are marked touched and before any action would run. The cookbook pattern focuses the
  first error: pull `errorSummary()[0]`, get its `fieldTree()`, and call
  `focusBoundControl()`.
- `ignoreValidators` chooses which validators submit is allowed to **skip** when
  deciding whether the form is submittable:
  - `'pending'` (the framework **default**) - submit despite still-pending async
    validators; it does not wait for them.
  - `'none'` - skip nothing: wait for every validator, async included, and block the
    action until they all settle and pass. This is what `09` and `10` use, so a
    `validateHttp` check must resolve valid before the action fires.
  - `'all'` - skip all validation and run the action regardless of form validity.

`10` `app.ts` uses the identical config, with the action setting a `submitted` signal
from the async result.

> The cookbook only ever uses `ignoreValidators: 'none'`. `'pending'` (default) and
> `'all'` are valid docs API but appear in no recipe; reach for them only when you
> deliberately want to submit without waiting on async checks.

---

## Exposing submitting state

Both styles expose `submitting()` on the root field. Surface it as a `computed` and
drive the button's disabled/label from it:

```ts
protected readonly submitting = computed(() => this.answerForm().submitting());
```

```html
<button type="submit" [disabled]="submitting()">…</button>
```

`submit` already refuses overlapping submissions on its own, but `submitting()` is
still what you use to guard **sibling** mutations - `10` early-returns from
`selectRole`/`retry` while `submitting()` is true so the user can't swap roles or reset
the form mid-submit.

## Resetting after success

On a successful action, reset the model with `form().reset(nextValue)` to clear values,
touched/dirty state, and any lingering errors. `09` resets to a fresh answer between
questions inside the action; `10`'s `retry`/`selectRole` reset via
`applicationForm().reset(createApplication(role))`. Reset from the action (or a guarded
handler), not from an `effect`.

---

## Routing server errors back onto specific fields

The action's **return value** is how the server's verdict re-enters the form. Return
`undefined` (or `null`) on success; return a validation error (or array of them) on
failure, and - critically - set `fieldTree` so the error lands on the right field
rather than the form root.

From `09` `gradeSubmission`, an async grade that pins a wrong answer to `answer`:

```ts
private async gradeSubmission(field: FieldTree<QuizAnswer>) {
  const result = await this.grader.grade(question.id, field.answer().value());

  if (result.correct) {
    this.index.update((current) => current + 1);
    this.answerForm().reset({ ...INITIAL_ANSWER });
    return undefined; // success
  }

  return {
    kind: 'wrongAnswer',
    message: result.message,
    fieldTree: field.answer, // route the error onto the answer field
  };
}
```

The returned error becomes a real field error you can read anywhere off that field:

```ts
protected readonly shaking = computed(() =>
  this.answerForm.answer().errors().some((e) => e.kind === 'wrongAnswer'),
);
```

and render through your `app-validation-errors` bound to that field. Because the error
carries `fieldTree`, `onInvalid`-style focus routing and `errorSummary()` also see it.

**Server errors auto-clear on edit.** A submission error stays on its field only until
the user edits that field; the next change to the value drops it, so you do not clear
it by hand. That is what makes `09`'s shake-on-wrong-answer feel right: the error (and
the shake) vanish the moment the user picks a different option.

**Many errors at once.** When the server rejects several fields, return an **array** of
errors, each with its own `fieldTree`, and each lands on its target:

```ts
return result.errors.map((err) => ({
  kind: 'serverError',
  message: err.message,
  fieldTree: field[err.field],
}));
```

A single error object (not wrapped in an array) without a `fieldTree` lands on the form
root - fine for a form-wide "submission failed" banner, wrong for a per-field message.

The async work itself lives in a `@Service()` (`09`'s `GraderService`), keeping the
component thin; the component just interprets the returned `GradeResult`.

---

## Testing caveat: NbDialog under jsdom

Neither `08` nor `09` opens a dialog on submit (`09` shows an inline "passed" card,
`08` flips an inline `booked()` banner), so their specs need no dialog stubs. But if a
submission flow opens an ng-brutalism `NbDialog` for confirmation, jsdom does **not**
implement the native `<dialog>` methods (`show` / `showModal` / `close`) that
`NbDialog` calls, and any spec that opens or closes it throws. The repo's
`test-setup.ts` stubs those methods; reuse that setup for any dialog-driven submit.
Follow the zoneless test rhythm otherwise: act, `await fixture.whenStable()`, assert -
never `fixture.detectChanges()`.

---

## Do / Don't

- **Do** put `[formRoot]` on the `<form>` and use a `type="submit"` button.
- **Do** pick one trigger: imperative `submit(form, action)`, or the declarative
  `submission` config driven by `[formRoot]`. Don't wire both to the same action.
- **Do** return `undefined`/`null` for success and an error object with `fieldTree` set
  to route server failures onto the exact field; return an **array** of them for
  several fields at once.
- **Do** rely on `submit`'s `Promise<boolean>` and its built-in double-submit guard;
  read `submitting()` to guard sibling mutations, not to re-guard `submit` itself.
- **Do** expose `submitting()` as a `computed` and disable the submit button with it.
- **Do** `reset(nextValue)` after a successful action to clear values, touched/dirty,
  and errors; let server errors auto-clear when the user edits the field.
- **Do** keep the async call in a `@Service()`; let the component read the result.
- **Don't** return a bare error without `fieldTree` when you mean it for a specific
  field - it lands on the root and your per-field error UI won't show it.
- **Don't** hand-clear a server error on keystroke; it auto-clears when the field is
  edited.
- **Don't** run the action before validation by hand; `submit` and the `submission`
  config validate first (`ignoreValidators: 'none'` waits for and runs everything,
  async included).
