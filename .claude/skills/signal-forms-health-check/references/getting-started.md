# Getting Started with Signal Forms

Angular 22's signal forms (`@angular/forms/signals`) replace `ReactiveFormsModule` /
`FormBuilder`. There is no `NgModule`, no `FormGroup`, no `subscribe()`. You model the
data as a `WritableSignal`, build a form over it with `form()`, and bind fields in the
template with the `FormField` directive. Everything you read (value, validity, dirty,
errors) is a signal.

`form()` takes a **writable signal of a plain object** and returns a field tree that
mirrors the model's shape. The objects and arrays it walks (the _structural layer_) must
be plain JS objects/arrays. Leaf values may be primitives, `null`, or `Date` (for native
date/time inputs). Class instances, `Map`, and `Set` are **not** supported in the
structural layer, and no property may be `undefined` (an `undefined` field is dropped
from the tree). Updating the model signal updates the form; updating the form's fields
updates the model signal - it is one source of truth, both ways.

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

Model-design rules the docs treat as fundamental (`model-design`):

- **Type every field; initialize every field.** Declare an explicit `type`/`interface`
  and give every property a value. No optional (`?`) fields, no `undefined` - a missing
  value means the field never exists in the tree. Use `''` for empty text, `null` for an
  empty complex value.
- **Match the UI control's data type.** A `<select>` yields strings, so a numeric-looking
  dropdown is still `string` in the model. `type="number"` inputs are `number | null`.
- **Prefer a static shape.** Keep the model's structure constant instead of adding or
  removing fields as values change; hide inactive fields with `hidden`/`disabled` in the
  schema so toggling never drops the user's data. Two sanctioned exceptions: **arrays**
  (variable length is fine - phone numbers, line items) and **atomic fields** the UI
  consumes whole without editing sub-fields.
- **Keep one model per form.** Don't fold unrelated concerns (login + preferences + cart)
  into one model. When the form model and your domain model differ, translate with a
  `linkedSignal` in and `submit()`/`effect()` out.

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
forms track submit/pending state for you (`userForm().submitting()`), so there is no
manual `(ngSubmit)` plumbing. The alternative is the standalone `submit(form, action)`
function called from a handler (recipe 08). Either way, submit marks all fields touched,
runs validation, and only calls `action` when the form is valid; an optional `onInvalid`
callback receives the field so you can focus the first error. See submission.md.

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

**The tree mirrors the model shape.** A `FieldTree<T>` has one property per property of
`T`, recursively. You navigate it exactly like the data - dot into objects, index into
arrays - and every node is itself a field you can bind or call:

```ts
userForm.name; // FieldTree<string>
userForm.address.city; // nested object -> FieldTree<string>
userForm.toppings[0].count; // array element -> FieldTree<number>
userForm.address.city(); // call any node for its FieldState
```

There is no `.controls()` accessor: children are reached by navigating the tree
(`userForm.toppings[$index]` in a template `@for`), not by a collection method.

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

Available on any FieldState (leaf, group, or root):

| Member            | Kind                | Meaning                                                          |
| ----------------- | ------------------- | ---------------------------------------------------------------- |
| `.value`          | `WritableSignal<T>` | current value; call `.value()` to read, `.value.set(x)` to write |
| `.valid()`        | `Signal<boolean>`   | no errors **and** no pending validators (children included)      |
| `.invalid()`      | `Signal<boolean>`   | at least one error, regardless of pending validators             |
| `.pending()`      | `Signal<boolean>`   | an async validator is still running                              |
| `.errors()`       | `Signal<...[]>`     | this field's own errors (leaf-level) - see below                 |
| `.errorSummary()` | `Signal<...[]>`     | this field's errors **and every descendant's** (bind on groups)  |
| `.dirty()`        | `Signal<boolean>`   | value changed since seed / last reset                            |
| `.touched()`      | `Signal<boolean>`   | control has been blurred (or marked)                             |
| `.disabled()`     | `Signal<boolean>`   | field rejects input and does not affect parent validity          |
| `.hidden()`       | `Signal<boolean>`   | field is flagged hidden (you still gate the DOM with `@if`)      |
| `.readonly()`     | `Signal<boolean>`   | field shows its value but cannot be edited                       |
| `.required()`     | `Signal<boolean>`   | a `required` rule is active on the field                         |
| `.submitting()`   | `Signal<boolean>`   | the field/form is mid-submit (see submission)                    |
| `.metadata(key)`  | method              | read a metadata value (see field-metadata.md)                    |

`valid()` is **not** `!invalid()`. A field with a pending async validator is neither
valid (a validator hasn't resolved) nor invalid (no error yet) - both are `false`. Gate
"can submit" on `!invalid() && !pending()`, or on `valid()`, never on `!invalid()` alone.

**Writing values.** `.value` is a `WritableSignal`, so you set a field imperatively with
`field().value.set(x)` (recipes 08/09 seed a variant or an answer this way). A `.set()`
bypasses `debounce`; only View->model input is debounced.

**State methods** on a FieldState:

- `.reset(value?)` - clears `dirty`/`touched` on the field and its descendants; pass a
  value to also set the model (`userForm().reset({ ...INITIAL_REGISTRATION })`).
- `.markAsTouched(options?)` - marks the field (and, unless `skipDescendants: true`, its
  descendants) touched; the canonical way to surface errors in a test.
- `.markAsDirty()` - marks the field dirty.
- `.focusBoundControl(options?)` - moves focus to the control bound to this field
  (used from `onInvalid` via `errorSummary()[0]?.fieldTree().focusBoundControl()`).

## 5b. State propagates up; disabled/hidden/readonly step out

State flows **from children up to parents and the root**. When any leaf becomes invalid,
dirty, or touched, its enclosing group and the root reflect it - so `userForm().valid()`
means "every interactive field is valid and nothing is pending", and `userForm().dirty()`
means "the user changed at least one field". This is why you gate a Save button on the
root, not on each field.

`disabled`, `hidden`, and `readonly` fields are **non-interactive**: they are excluded
from the parent's `valid` / `touched` / `dirty` aggregation. A `hidden` (or `disabled`)
field does **not** participate in validation - a `required` rule on a hidden field will
not block submit. This is exactly why model-design favors a static shape with
schema-driven `hidden`/`disabled`: the field keeps its data but stops constraining the
form while it is out of play.

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
- **Do** seed numbers/selects as `| null`, not `0` / `''`, and give every field a value
  (no `?` / `undefined`, or the field vanishes from the tree).
- **Do** keep a static model shape; hide inactive fields with schema `hidden`/`disabled`
  (arrays and atomic whole-object fields are the sanctioned dynamic exceptions).
- **Do** gate "can submit" on `valid()` (or `!invalid() && !pending()`), never on
  `!invalid()` alone - a pending async validator leaves both `valid` and `invalid` false.
- **Do** write a field imperatively with `field().value.set(x)` when you need to (variant
  swaps, programmatic answers); remember it skips `debounce`.
- **Don't** confuse `userForm.name` (bind/navigate) with `userForm.name()` (state). A
  stray `()` or a missing one is the most common signal-forms mistake.
- **Don't** expect a `required` rule on a `hidden` or `disabled` field to block submit -
  non-interactive fields drop out of parent validity.
- **Don't** gate show-invalid with an impure pipe on a `Field`. Use `@let` on field
  state, or a pure helper from a `computed`. `Field` identity never changes, so a pipe
  would need `pure: false`.
- **Don't** reach for `@Input()`/`@Output()`, constructor injection, `*ngIf`/`*ngFor`,
  or `subscribe()`. Use `input()`/`output()`, `inject()`, `@if`/`@for`, and signals.
