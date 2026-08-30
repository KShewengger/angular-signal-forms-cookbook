# Custom Controls in Signal Forms

Two ways to plug your own component into a signal form: implement a control interface
(`FormValueControl` for a single value, `FormCheckboxControl` for a boolean) so
`[formField]` binds the value plus its state, or accept a `FieldTree` subtree and drive
a fragment of the form yourself. Grounded in recipe `06-custom-control`
(a pizza-topping counter) and the container pattern from `10-dynamic-forms` /
recipe 12 field-metadata.

---

## `FormValueControl` - the framework binds value AND state

A `FormValueControl<T>` is a component the parent binds with `[formField]`, exactly
like a native `<input>`. The parent points at a **leaf** field; the framework then
two-way-binds the value and pushes every piece of field state in as inputs.

From `06` `topping/topping.ts` - a numeric stepper control:

```ts
export class Topping implements FormValueControl<number | undefined> {
  readonly topping = input.required<PizzaTopping>();

  readonly value = model<number>();
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  readonly touched = input(false);
  readonly touch = output<void>();

  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly hidden = input<boolean>(false);
}
```

The contract, by member:

- `value` is a **`model<T>()`** - this is the two-way channel, and the **only required
  member**. When the user edits, call `this.value.set(...)` / `this.value.update(...)`
  and the field's model updates.
- `touch` is an **`output<void>()`**: emit it on blur so the field learns it was
  touched. `06`'s template does `(blur)="touch.emit()"`. Emit on **blur**, not focus,
  so `debounce('blur')` keeps working.
- Everything else is an **`input()` the framework fills** from the bound field's
  state. Declare only the ones you render; each is optional.

The full set of framework-provided state inputs (all optional, all `input()`), from
the shared `FormUiControl` base that both control interfaces extend:

| Group        | Input                                  | Type                                                |
| ------------ | -------------------------------------- | --------------------------------------------------- |
| Interaction  | `touched`, `dirty`                     | `boolean`                                           |
| Validation   | `errors`                               | `readonly WithOptionalFieldTree<ValidationError>[]` |
|              | `valid`, `invalid`, `pending`          | `boolean`                                           |
| Availability | `disabled`, `readonly`, `hidden`       | `boolean`                                           |
|              | `disabledReasons`                      | `readonly DisabledReason[]`                         |
| Constraints  | `required`                             | `boolean`                                           |
|              | `min`, `max`, `minLength`, `maxLength` | `number \| undefined`                               |
|              | `pattern`                              | `RegExp[]`                                          |
| Identity     | `name`                                 | `string`                                            |

The constraint inputs are the same operands published as field **metadata** (see
`field-metadata.md`): the framework reads `MAX_LENGTH`/`MIN_NUMBER`/`PATTERN`/… off
the field and hands them to the matching control input, so a control can render its
own `[maxlength]` / `[required]` / `[min]` attributes without the parent wiring them.
`06`'s `Topping` declares only the seven it renders (`errors`, `touched`, `invalid`,
`dirty`, `disabled`, `readonly`, `hidden`); the cookbook does not yet consume
`valid`, `pending`, `disabledReasons`, `required`, `min`/`max`, `minLength`/`maxLength`,
`pattern`, or `name`, but they are available on the same interface.

Typing: `FormValueControl<number | undefined>` matches the `model<number>()` (a
`model` without a default is `T | undefined`). Keep the two in sync.

The control renders itself from that state - no manual subscription:

```ts
protected readonly errorBorder = computed(() => this.dirty() && this.invalid());
protected readonly showErrors = computed(
  () => this.invalid() && (this.dirty() || this.touched()),
);

protected update(input: HTMLInputElement) {
  this.value.set(input.value === '' ? 0 : input.valueAsNumber);
}
protected increment() { this.value.update((num) => (num ?? 0) + 1); }
```

### The control owns its validation

Validation is not the control's private business logic - it lives in the **schema**
for the field the control is bound to, and flows back in through `errors`/`invalid`.
From `06` `app.schema.ts`, the per-item schema attached with `applyEach` + `apply`:

```ts
export const pizzaToppingItemSchema = schema<PizzaFormModelItem>((item) => {
  min(item.count, 0, { message: 'No negative' });
  validate(item.count, ({ value, valueOf }) => {
    const max = PIZZA_TOPPINGS_MAP[valueOf(item.id)]?.max ?? 0;
    return value() > max ? { kind: 'toppingMax', message: `Max ${max}` } : null;
  });
});
```

The control just displays what it receives (`[errors]="errors()"`,
`[visible]="showErrors()"` into a presentational `app-validation-errors`). This keeps
the same control reusable across forms with different rules.

### How the parent binds

The parent binds a leaf field with `[formField]`, identical to a native control. From
`06` `app.html`, one control per array item:

```html
@for (topping of pizzaToppings; track topping.id) {
<app-topping [topping]="topping" [formField]="pizzaMakerForm.toppings[$index].count" />
}
```

`pizzaMakerForm.toppings[$index].count` is a leaf `FieldTree<number>`; `[formField]`
does the wiring. `[topping]` is an ordinary input, unrelated to the form.

---

## `FormCheckboxControl` - the two-way channel is `checked`, not `value`

For an on/off control (a toggle, a switch, a styled checkbox) implement
**`FormCheckboxControl`** instead. It is identical to `FormValueControl` except the
two-way channel is a **`checked = model<boolean>()`** rather than `value`. All the
same `FormUiControl` state inputs (`errors`, `touched`, `disabled`, …) and the `touch`
output apply.

```ts
import { FormCheckboxControl } from '@angular/forms/signals';

export class ToggleSwitch implements FormCheckboxControl {
  readonly checked = model<boolean>(false);

  readonly touch = output<void>();
  readonly disabled = input(false);
  readonly touched = input(false);
}
```

The framework detects which interface a control implements by which model it declares:
a control has **either** `value` (bound to the field's value) **or** `checked` (bound
to the field's boolean) - never both. `[formField]="form.agree"` on a boolean leaf
binds `checked`; on any other leaf it binds `value`. The cookbook's `06` control is a
`FormValueControl`; no recipe implements `FormCheckboxControl` yet (recipe 12's pinned
box uses the native ng-brutalism `nbCheckbox` with `[formField]`, not a custom control).

### Parsing a string into a typed value: `transformedValue`

When the DOM value is a string but the model is typed (a date, a number, a currency),
the docs provide **`transformedValue(this.value, { parse, format })`** - it wraps the
control's `value` model in a writable signal that `format`s model→display and `parse`s
display→model (returning `{ value }` or `{ error }`). Docs-only for now: the cookbook
does the same job with `[value]` + a manual `update()` (`06`) or format-gated fields in
the schema (`08`), so `transformedValue` is documented here but not used by any recipe.

---

## Contrast: the field-subtree container pattern

When a component should own a **branch** of the form (multiple fields, its own
layout, add/remove logic) rather than one value, don't implement `FormValueControl`.
Instead accept the subtree as an input typed `FieldTree<...>` and bind native
controls inside it.

From `10` `frontend-form/frontend-form.ts`:

```ts
export class FrontendForm {
  readonly form = input.required<FieldTree<Application>>();

  protected readonly selectedEngagement = computed(() => this.form().engagement().value().kind);

  protected selectEngagement(kind: EngagementKind): void {
    this.form().engagement().value.set(createEngagement(kind));
  }
}
```

The parent passes the subtree down as a plain input (`[form]="applicationForm"`),
and the child reaches into it (`this.form().engagement()`, `this.form().name`) and
binds its own leaves with `[formField]`. Recipe 12's field-metadata containers and
`10`'s `skill-composer` (which takes `input.required<FieldTree<string[]>>()`) use the
same shape.

### When to use which

- **`FormValueControl`** - the component _is_ one field: a fancy input, a stepper,
  a rating, a color picker. One value in, state in, edited value out. Bound with
  `[formField]` like a native element. Reusable across forms; validation stays in the
  host form's schema.
- **`FieldTree` container** - the component owns a _fragment_ of the form: several
  related fields, repeated items, or a section with its own affordances. Bound with a
  plain `input<FieldTree<T>>()`, and it manipulates the subtree directly.

Rule of thumb: if the parent would write `[formField]="...one leaf..."`, build a
`FormValueControl`. If it would hand over a whole branch, pass a `FieldTree`.

---

## Gotchas

- The two-way channel must be a **`model()`**, not an `input()`. Only `model` writes
  back to the field.
- Declare **`value` or `checked`, never both** - the framework picks the interface by
  which model is present. Use `FormCheckboxControl` (`checked`) for booleans,
  `FormValueControl` (`value`) for everything else.
- Type the interface parameter to match the model: `FormValueControl<number | undefined>`
  for `model<number>()`.
- Everything except `value`/`checked` and `touch` is an optional `input()` fed from
  field state - including `disabled`, `readonly`, and the constraint operands
  (`required`, `min`, `max`, `maxLength`, `pattern`). A schema `disabled()` or
  `required()` rule propagates in through these inputs; bind them to the native element
  (`[disabled]`, `[required]`) rather than tracking that state yourself.
- Emit `touch` on blur, or the field never becomes `touched()` and your
  touched-gated error display never fires.
- Put validation in the **schema**, not inside the control; the control renders
  `errors`/`invalid` it is given so it stays form-agnostic.
- Don't reach for a `FieldTree` container just to add one custom input - that's what
  `FormValueControl` is for. Don't force a multi-field section through
  `FormValueControl` by packing an object into one `value` - pass the subtree.
