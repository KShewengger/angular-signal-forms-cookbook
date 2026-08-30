# Getting Started with Signal Forms

Angular 22's signal forms (`@angular/forms/signals`) replace `ReactiveFormsModule` /
`FormBuilder`. There is no `NgModule`, no `FormGroup`, no `subscribe()`. You model the
data as a `signal()`, build a form over it with `form()`, and bind fields in the
template with the `FormField` directive. Everything you read (value, validity, dirty,
errors) is a signal.

Grounded in recipe 01 (`apps/01-basic-form`).

## 1. Model the form data as a signal

The type and its `INITIAL_*` seed live in `app.model.ts`, never in the component.

```ts
// app.model.ts
export type RegistrationFormModel = {
  name: string;
  age: number | null;
  role: 'admin' | 'moderator' | 'user' | null;
  bio: string;
  beginner: boolean;
};

export const INITIAL_REGISTRATION: RegistrationFormModel = {
  name: '',
  age: null,
  role: null,
  bio: '',
  beginner: false,
};
```

Empty-but-typed seeds. A number that starts blank is `number | null` seeded `null`
(not `0`), a single-select is a string union `| null` seeded `null`. Do not seed with a
value the user did not enter.

## 2. Build the form with `form(model, schemaFn)`

The component is **standalone**, `OnPush`-friendly, and injects nothing here beyond what
it builds. The model signal is `private`; the form is `protected` so the template can
reach it.

```ts
// app.ts
import { Component, computed, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { INITIAL_REGISTRATION, RegistrationFormModel } from './app.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [FormField, FormRoot /* + ng-brutalism UI */],
})
export class App {
  private readonly userModel = signal<RegistrationFormModel>({
    ...INITIAL_REGISTRATION,
  });

  protected readonly userForm = form(
    this.userModel,
    (path) => {
      required(path.name);
    },
    {
      submission: {
        action: async () => {
          this.dialog().open();
        },
      },
    },
  );
}
```

The second argument is the **schema function**: it receives a `path` tree and wires
validators onto fields. A 1-5 line one-form schema is inlined here (recipe 01). A longer
one moves to an exported `SchemaFn` in `app.schema.ts` (recipe 02 onward). See
`schemas.md`.

The third argument is options. `submission.action` is the async submit handler; signal
forms track submit/pending state for you, so there is no manual `(ngSubmit)` plumbing.

## 3. Bind fields in the template

Bind the `<form>` element with `[formRoot]` and each control with `[formField]`. The
`FormField` directive is two-way: it reads the model into the control and writes user
input back into the signal.

```html
<!-- app.html -->
<form nbStack gap="md" [formRoot]="userForm">
  <label nbLabel for="name">Name</label>
  <input nbInput id="name" type="text" [formField]="userForm.name" />

  <label nbLabel for="age">Age</label>
  <input nbInput id="age" type="number" [formField]="userForm.age" />

  <nb-select id="role" [formField]="userForm.role"> ... </nb-select>

  <textarea nbTextarea id="bio" [formField]="userForm.bio"></textarea>

  <input nbCheckbox id="beginner" type="checkbox" [formField]="userForm.beginner" />

  <button nbButton type="submit" [disabled]="!canSave()">Save</button>
</form>
```

`[formField]="userForm.name"` binds the **field node**, not its value. The directive
handles the control's value, `input`/`blur` events, dirty/touched tracking, and
`type="number"` / checkbox coercion.

## 4. The field-as-function duality

This is the core mental model. A field node is both a tree you navigate and a function
you call.

- `userForm.name` is a **FieldTree**: a navigable node. You pass it to `[formField]`,
  you index deeper into it (`userForm.address.city`), you hand it to a child component.
- `userForm.name()` is the **FieldState**: call the node to get its reactive state
  object. From there every readout is a signal.

```ts
userForm.name; // FieldTree  -> bind this, navigate this
userForm.name(); // FieldState -> the state object
userForm.name().value(); // the field's current value signal
userForm().value(); // the whole form's value (call the root, then .value())
```

The root form is a field too: `userForm()` is the root FieldState, `userForm().valid()`
its aggregate validity.

## 5. Read state signals

Every piece of UI state is a signal you call. Drive `computed()`s and template bindings
from them, never from method calls in the template.

```ts
protected readonly value = computed(() => this.userForm().value());
protected readonly formValid = computed(() => this.userForm().valid());
protected readonly canSave = computed(
  () => this.userForm().dirty() && !this.userForm().invalid(),
);
```

Available on any FieldState (leaf or group):

| Signal       | Meaning                                          |
| ------------ | ------------------------------------------------ |
| `.value()`   | current value                                    |
| `.valid()`   | passes all validators (and children are valid)   |
| `.invalid()` | has at least one error                           |
| `.dirty()`   | value changed since seed / last reset            |
| `.touched()` | control has been blurred                         |
| `.errors()`  | this field's own errors (leaf-level) - see below |

Reset with `userForm().reset({ ...INITIAL_REGISTRATION })`. `reset()` clears dirty and
touched and restores the seed.

## 6. The show-invalid gate: `@let` on field state, not a pipe

Do not show an error the instant the form loads. Gate it behind
`(dirty || touched) && invalid`. Compute that gate with `@let` bound to **field state**,
because a `Field` reference is identity-stable: its object does not change when
dirty/touched/invalid flip, so a pipe over it would have to be `pure: false` and would
re-run every change detection and fight `OnPush`.

Canonical template gate:

```html
@let name = userForm.name(); @let nameInvalid = (name.dirty() || name.touched()) && name.invalid();

<input nbInput [formField]="userForm.name" [attr.aria-invalid]="nameInvalid" />
@if (nameInvalid) {
<p role="alert">{{ name.errors()[0]?.message }}</p>
}
```

When TypeScript (not the template) needs the gate, use a tiny plain helper, not a pipe.
Recipe 02 packages the same formula in a computed:

```ts
// app.utils.ts - pure helper, no pipe
export function fieldTouchedInvalid(field: {
  touched(): boolean;
  invalid(): boolean;
}): boolean {
  return field.touched() && field.invalid();
}

// app.ts
protected readonly ariaInvalid = computed(() => ({
  username: fieldTouchedInvalid(this.userForm.username()),
  email: fieldTouchedInvalid(this.userForm.email()),
}));
```

## Do / Don't

- **Do** keep the model signal `private` and the form `protected`; expose only what the
  template needs.
- **Do** bind the `<form>` with `[formRoot]` and each control with `[formField]`.
- **Do** read state through signals in `computed()`s (`userForm().dirty()`), and pass
  those to `[disabled]` etc.
- **Do** seed numbers/selects as `| null`, not `0` / `''`.
- **Don't** confuse `userForm.name` (bind/navigate) with `userForm.name()` (state). A
  stray `()` or a missing one is the most common signal-forms mistake.
- **Don't** gate show-invalid with an impure pipe on a `Field`. Use `@let` on field
  state, or a pure helper from a `computed`. `Field` identity never changes, so a pipe
  would need `pure: false`.
- **Don't** reach for `@Input()`/`@Output()`, constructor injection, `*ngIf`/`*ngFor`,
  or `subscribe()`. Use `input()`/`output()`, `inject()`, `@if`/`@for`, and signals.
