# Form Submission in Signal Forms

The submission flow: mark the `<form>` as the form root, run an async action through
`submit`, expose submitting state to the template, and route the server's errors back
onto the fields that caused them. Grounded in recipe `09-form-submission` (a graded
pop quiz) and `08-conditional-validation` (a cinema booking).

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

`submit` runs validation first; the action runs only if the form is valid. The action
is `async`, and the form's `submitting()` flips true for its duration.

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

- `action(field)` receives the form's `FieldTree` and does the async work.
- `onInvalid(field)` runs when submit is attempted on an invalid form. The cookbook
  pattern focuses the first error: pull `errorSummary()[0]`, get its `fieldTree()`,
  and call `focusBoundControl()`.
- `ignoreValidators: 'none'` runs every validator on submit (nothing skipped).

`10` `app.ts` uses the identical config, with the action setting a `submitted` signal
from the async result.

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

Guard re-entrant handlers with it too - `10` early-returns from `selectRole`/`retry`
while `submitting()` is true so the user can't mutate a form mid-submit.

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
- **Do** return `undefined` for success and an error object with `fieldTree` set to
  route server failures onto the exact field.
- **Do** expose `submitting()` as a `computed` and disable the submit button with it;
  guard other mutations while submitting.
- **Do** keep the async call in a `@Service()`; let the component read the result.
- **Don't** return a bare error without `fieldTree` when you mean it for a specific
  field - it lands on the root and your per-field error UI won't show it.
- **Don't** run the action before validation by hand; `submit` and the `submission`
  config validate first (`ignoreValidators: 'none'` runs everything).
