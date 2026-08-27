# 09 · Form Submission

> The **form submission** recipe: a neo-brutalist **Signals Pop Quiz** dealt as a
> flashcard deck. Every card is _one form submission_, you answer, hit **Submit**, and a
> mock server (`GraderService`) grades it. Its verdict routes straight back onto the field
> via the **`[formRoot]`** submission API: a wrong answer returns a field-targeted error
> (`fieldTree`) that shows under the card and clears the moment you edit, and a correct
> answer resolves the submission and swipes in the next card. No `ReactiveFormsModule`, no
> `FormBuilder`.

<p align="center">
  <img
    src="./public/preview-app.png"
    alt="Form submission Signals Pop Quiz deck built with Angular Signal Forms"
    width="280"
  />
</p>

<p align="center">Part of the <a href="../../README.md">Angular Signal Forms Cookbook</a>.</p>

---

## How to run

Run every command from the **repository root**. This is an Nx integrated monorepo, so
all projects share a single root `package.json`.

| Task                              | Command                                 |
| --------------------------------- | --------------------------------------- |
| **Serve** (http://localhost:4209) | `pnpm serve:09-form-submission`         |
| Serve (direct)                    | `pnpm exec nx serve 09-form-submission` |
| Build                             | `pnpm exec nx build 09-form-submission` |
| Test                              | `pnpm exec nx test 09-form-submission`  |

---

## Signal Forms API at a glance

| API                                           | What it does                                                                       | Where in this recipe                |
| --------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| `form(model, schema, { submission })`         | Configures the submission `action`, `onInvalid`, and `ignoreValidators`            | `answerForm`                        |
| `[formRoot]`                                  | Wires a native `<form>` to submit the form (sets `novalidate`, prevents default)   | `<form [formRoot]="answerForm">`    |
| `field().submitting()`                        | `true` while the async action runs; drives the spinner and the double-submit guard | the Submit button                   |
| action returns `undefined`                    | Submission succeeded                                                               | correct answer → deal the next card |
| action returns `{ kind, message, fieldTree }` | A **field-level** server error, routed onto the answer field                       | wrong answer → error under the card |
| `onInvalid` + `focusBoundControl()`           | Runs when client validation blocks the submit; focuses the first invalid field     | submit an empty card                |
| `ignoreValidators: 'none'`                    | The action only runs once every validator passes (pending validators block it)     | configured on `answerForm`          |
| `submit(form, action)` → `Promise<boolean>`   | The imperative alternative to `[formRoot]`: resolves `true`/`false`                | not used here (see below)           |
| `required`                                    | Client rule that gates the action                                                  | `required(path.answer)`             |

---

## The form

The whole quiz runs on **one reusable single-field form**, reset between cards.

| Field    | Control                                              | Type     | Validation           |
| -------- | ---------------------------------------------------- | -------- | -------------------- |
| `answer` | `nbInput` (text card) / choice buttons (choice card) | `string` | `required` on submit |

```ts
export type QuizAnswer = { answer: string };
```

The one client rule is inlined on `form()`:

```ts
protected readonly answerForm = form(
  this.answerModel,
  (path) => {
    required(path.answer, {
      message: 'Answer this question before submitting.',
    });
  },
  { submission: { action, onInvalid, ignoreValidators: 'none' } },
);
```

Each card binds the same field: the text card with `[formField]`, the multiple-choice card
by writing the selected option into `answerForm.answer().value`.

---

## Submission (the recipe's core idea)

The submission is configured **on `form()`**, and the native `<form [formRoot]>` triggers it.
The `action` is where the server lives: it grades the answer and **returns** the result as a
validation result, exactly as the guide describes.

```ts
protected readonly answerForm = form(
  this.answerModel,
  (path) => {
    required(path.answer, {
      message: 'Answer this question before submitting.',
    });
  },
  {
    submission: {
      action: (field) => this.gradeSubmission(field),
      onInvalid: (field) =>
        field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      ignoreValidators: 'none',
    },
  },
);

private async gradeSubmission(field: FieldTree<QuizAnswer>) {
  const question = this.currentQuestion();
  const result = await this.grader.grade(question.id, field.answer().value());

  if (result.correct) {
    this.index.update((current) => current + 1); // advance; `phase` derives 'passed' at the end
    this.answerForm().reset({ ...INITIAL_ANSWER });
    return undefined; // submission succeeded
  }

  // field-level server error: shows under the answer and clears when the user edits
  return { kind: 'wrongAnswer', message: result.message, fieldTree: field.answer };
}
```

| Return value                   | Kind of error | Effect                                                         |
| ------------------------------ | ------------- | -------------------------------------------------------------- |
| `undefined`                    | none          | submission succeeds, the deck swipes to the next card          |
| `{ kind, message, fieldTree }` | field-level   | the message shows under the answer; the card shakes; you retry |

> **`[formRoot]` vs `submit()`.** `[formRoot]` submits declaratively from the template
> (used here). The manual `submit(answerForm, action)` returns a `Promise<boolean>` you can
> `await` to branch on success, handy when you would rather advance from a click handler
> than from inside the action.

---

## The mock server

`GraderService` is an injectable `@Service()` that stands in for a backend: it scores the
answer synchronously, then resolves a `Promise` after a short delay so `submitting()` is
actually visible.

```ts
@Service()
export class GraderService {
  grade(questionId: string, answer: string): Promise<GradeResult> {
    const question = QUESTIONS.find((entry) => entry.id === questionId);
    const correct = question !== undefined && answer.trim().toLowerCase() === question.answer;

    const result: GradeResult = correct ? { correct: true } : { correct: false, message: $localize`:@@wrongAnswer:Not quite, try again.` };

    return new Promise<GradeResult>((resolve) => setTimeout(() => resolve(result), 500));
  }
}
```

---

## Error display

Both messages surface through the shared **`ValidationErrors`** component bound to the
answer field (`[field]="answerField"`), which reads `errorSummary()` and gates visibility on
`(dirty() || touched()) && invalid()`. Submission errors attach to the field and, per the
guide, **clear the moment the user edits that field**, so a wrong answer's red state
disappears as soon as you change your answer.

| Message                                   | Level            | Shows when                                         |
| ----------------------------------------- | ---------------- | -------------------------------------------------- |
| "Answer this question before submitting." | field (required) | submit an empty card (`onInvalid` also focuses it) |
| "Not quite, try again."                   | field (server)   | a wrong answer                                     |

---

## Form state

| State      | Signal                          | True when                                     |
| ---------- | ------------------------------- | --------------------------------------------- |
| Submitting | `answerForm().submitting()`     | the grading action is in flight               |
| Invalid    | `answerForm.answer().invalid()` | the answer is empty or carries a server error |
| Touched    | `answerForm.answer().touched()` | after a submit attempt (submit marks touched) |

---

## Tech & tools

| Layer     | Tool                                                                          | Purpose                                                                 |
| --------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Framework | **Angular 22** (standalone, signals, new control flow `@if`/`@for`/`@switch`) | Application shell and reactivity                                        |
| Forms     | **`@angular/forms/signals`**                                                  | `form()`, `[formRoot]`, `submitting()`, server errors                   |
| UI kit    | **ng-brutalism** (`@ng-brutalism/ui`)                                         | `nbButton`, `nbInput`, `nbText`, `nbCluster`, `nbSeparator`             |
| Icons     | **`@ng-icons/tabler-icons`**                                                  | Lesson-nav arrows, footer copyright, the replay icon                    |
| Styling   | **Tailwind CSS v4** (with the ng-brutalism theme)                             | Utility classes plus the card deck and `animate.enter` in `app.css`     |
| i18n      | **`@angular/localize`**                                                       | Translatable user-facing strings                                        |
| Tooling   | **Nx 23** + **esbuild**                                                       | Build, serve, and dependency graph                                      |
| Tests     | **Vitest 4**                                                                  | Isolated schema + grader-service + component + `ValidationErrors` tests |

---

## How it works

**1. Model the answer and the questions** (`app.model.ts`, `app.data.ts`)

One `{ answer: string }` field drives every card; the `QUESTIONS` array holds the prompts,
the correct answers, and the multiple-choice options.

**2. Inline the one client rule on `form()`** (`app.ts`)

`required(path.answer)` is passed straight to `form()`. Isolated tests rebuild the same
callback.

**3. Configure submission** (`app.ts`)

`form(model, schema, { submission: { action, onInvalid, ignoreValidators } })`. The `action`
calls the mock `GraderService`; a correct answer returns `undefined` and advances the deck,
a wrong answer returns a `{ kind, message, fieldTree }` field error.

**4. Submit from the template** (`app.html`)

```html
<form [formRoot]="answerForm">
  <input nbInput [formField]="answerField" />
  <button type="submit" [disabled]="submitting()">@if (submitting()) { Checking… } @else { Submit }</button>
</form>
```

---

## Testing

Following the [Signal Forms testing guide](https://angular.dev/guide/forms/signals/testing),
tests are split by concern:

- **Isolated schema tests** rebuild the same inline `required(path.answer)` callback and
  assert the `required` rule, without a component or DOM.
- **Grader-service tests** exercise the mock server directly (correct answers, case-insensitive
  and whitespace-trimmed matching, wrong answers, unknown questions), advancing Vitest fake
  timers to resolve the delayed `Promise`.
- **Component tests** cover the submission lifecycle through the DOM: the first card renders,
  an empty submit is blocked and reports the required error (`onInvalid`), a correct answer
  advances the deck, and a wrong answer shows the field error and shakes the card.
- **`ValidationErrors`** is tested against the real answer field, so its visibility gating,
  the required message, the single-error list, and its `role="alert"` are verified against the
  actual recipe.

---

## Internationalization

Every user-facing string is translatable. Template text uses `i18n="@@stableId"` and
TypeScript strings (the questions, the server message) use the `$localize` tagged template.
The `@angular/localize/init` polyfill is wired in `project.json` (build) and `test-setup.ts`
(tests). Keep the `@@` IDs stable; they are the translation contract.
