# Custom Controls in Signal Forms

Two ways to plug your own component into a signal form: implement `FormValueControl`
so `[formField]` binds a single value plus its state, or accept a `FieldTree` subtree
and drive a fragment of the form yourself. Grounded in recipe `06-custom-control`
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

- `value` is a **`model<T>()`** - this is the two-way channel. When the user edits,
  call `this.value.set(...)` / `this.value.update(...)` and the field's model updates.
- `errors`, `touched`, `invalid`, `dirty`, `disabled`, `readonly`, `hidden` are
  **inputs the framework fills** from the bound field's state. Declare only the ones
  you render; each is optional.
- `touch` is an **`output<void>()`**: emit it on blur so the field learns it was
  touched. `06`'s template does `(blur)="touch.emit()"`.

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
- Type the interface parameter to match the model: `FormValueControl<number | undefined>`
  for `model<number>()`.
- Emit `touch` on blur, or the field never becomes `touched()` and your
  touched-gated error display never fires.
- Put validation in the **schema**, not inside the control; the control renders
  `errors`/`invalid` it is given so it stays form-agnostic.
- Don't reach for a `FieldTree` container just to add one custom input - that's what
  `FormValueControl` is for. Don't force a multi-field section through
  `FormValueControl` by packing an object into one `value` - pass the subtree.
