# Array Fields and Per-Item Validation

When the form model holds a list, each item needs its own rules that can depend on
that item's own data. Recipe [`05-array-validation`](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/05-array-validation/README.md) is a pizza maker: the model is an
array of `{ id, count }`, and each topping's `count` must sit between `0` and a max
that varies per topping (`mozzarella` allows 1, `pepperoni` allows 5). Use
`applyEach` with a reusable item `schema`, not a hand-rolled loop.

## Model the array

The array is a plain field on the model. Give the item its own named type so the
item schema can be typed against it.

```ts
// apps/05-array-validation/src/app/app.model.ts
export type PizzaToppingId = 'pepperoni' | 'basil' | 'mozzarella' | 'tomato';

export type PizzaFormModelItem = { id: PizzaToppingId; count: number };

export type PizzaFormModel = {
  toppings: PizzaFormModelItem[];
};
```

Seed the array in the component signal, one entry per topping:

```ts
// apps/05-array-validation/src/app/app.ts
protected readonly pizzaMakerModel = signal<PizzaFormModel>({
  toppings: PIZZA_TOPPINGS.map((topping) => ({ id: topping.id, count: 0 })),
});

protected readonly pizzaMakerForm = form(this.pizzaMakerModel, pizzaMakerSchema);
```

## `applyEach(path.items, itemSchema)` with a named item helper

Write the per-item rules once as a reusable `schema<Item>()` object, then apply it
to every element with `applyEach`. This is the one case where wrapping in `schema()`
is justified: `applyEach` reuses the same `Schema` across every array item, so the
named helper is genuine reuse, not noise. (Contrast: a single-use `form()` does not
need a `schema()` wrap.)

```ts
// apps/05-array-validation/src/app/app.schema.ts
import { applyEach, min, schema, SchemaPathTree, validate } from '@angular/forms/signals';
import { PIZZA_TOPPINGS_MAP } from './app.data';
import { PizzaFormModel, PizzaFormModelItem } from './app.model';

export const pizzaToppingItemSchema = schema<PizzaFormModelItem>((item) => {
  min(item.count, 0, { message: 'Count cannot be negative' });

  validate(item.count, ({ value, valueOf }) => {
    const toppingId = valueOf(item.id);
    const maxCount = PIZZA_TOPPINGS_MAP[toppingId]?.max ?? 0;

    if (value() > maxCount) {
      return { kind: 'toppingMax', message: `Max ${maxCount}` };
    }
    return null;
  });
});

export function pizzaMakerSchema(path: SchemaPathTree<PizzaFormModel>): void {
  applyEach(path.toppings, pizzaToppingItemSchema);
}
```

Inside the item schema, `item` is the path tree for a single element:
`item.count` and `item.id` are its fields. The key move is that a per-item rule can
read the item's own sibling: `valueOf(item.id)` reads this row's topping id, which
selects the correct `max` from `PIZZA_TOPPINGS_MAP`. That is why every row can carry
a different limit while sharing one schema. Items validate independently: an
over-limit `mozzarella` does not invalidate a valid `pepperoni`.

Standalone built-in rules like `min` and a custom `validate` compose on the same
field; both contribute errors to `item.count`.

## Bind and read errors per row in the template

Index into the array field by `$index` inside `@for`, and read the row's error
state via `errorSummary()` on the array-item field.

```html
<!-- apps/05-array-validation/src/app/app.html -->
@for (topping of pizzaToppings; track topping.id) {
<nb-input-group class="w-32!">
  <input nbInput type="number" placeholder="0" [formField]="pizzaMakerForm.toppings[$index].count" />
</nb-input-group>
<app-validation-errors [field]="pizzaMakerForm.toppings[$index]" />
}
```

The `ValidationErrors` component binds the **array-item** field
(`pizzaMakerForm.toppings[$index]`), not the leaf `count`, and calls
`errorSummary()` to gather every error under that item (including nested-field
errors), then gates display on `dirty()`/`touched()`:

```ts
// apps/05-array-validation/src/app/validation-errors/validation-errors.ts
readonly field = input.required<Field<unknown>>();

protected readonly errors = computed(() => this.field()().errorSummary());

protected readonly showErrors = computed(() => {
  const state = this.field()();
  return (state.dirty() || state.touched()) && state.invalid();
});
```

Use `errorSummary()` for a group or array-item binding to roll up child errors; use
`errors()` for a single leaf field. Recipe 04's leaf-bound `ValidationErrors` reads
`errors()`; recipe 05's item-bound one reads `errorSummary()`.

## Index a row in tests with an `itemOf` helper

Array indices are positional and easy to get wrong by hand. Write a tiny
`itemOf(form, id)` helper that finds the row by its stable id and returns the
item `FieldTree`, then assert on `item.count()`.

```ts
// apps/05-array-validation/src/app/app.spec.ts
const buildPizzaForm = (counts: Partial<Record<PizzaToppingId, number>> = {}): FieldTree<PizzaFormModel> => {
  const model = signal<PizzaFormModel>({
    toppings: PIZZA_TOPPINGS.map((topping) => ({
      id: topping.id,
      count: counts[topping.id] ?? 0,
    })),
  });
  return form(model, pizzaMakerSchema, { injector: TestBed.inject(Injector) });
};

const itemOf = (pizzaForm: FieldTree<PizzaFormModel>, id: PizzaToppingId): FieldTree<PizzaFormModelItem> => {
  const index = PIZZA_TOPPINGS.findIndex((topping) => topping.id === id);
  return pizzaForm.toppings[index];
};

it('rejects a count above the topping max with toppingMax', () => {
  const item = itemOf(buildPizzaForm({ pepperoni: 6 }), 'pepperoni');
  expect(
    item
      .count()
      .errors()
      .map((e) => e.kind),
  ).toContain('toppingMax');
  expect(
    item
      .count()
      .errors()
      .map((e) => e.message),
  ).toContain('Max 5');
  expect(item.count().valid()).toBe(false);
});

it('keeps a valid item valid while a sibling is invalid', () => {
  const pizzaForm = buildPizzaForm({ pepperoni: 3, mozzarella: 2 });
  expect(itemOf(pizzaForm, 'pepperoni').count().valid()).toBe(true);
  expect(itemOf(pizzaForm, 'mozzarella').count().valid()).toBe(false);
});
```

Because `min` and the `toppingMax` `validate` are synchronous, these isolated
assertions need no `whenStable()`. In the DOM suite, drive a row through the same
`itemOf` helper and `item.count().value.set(6)` before `await fixture.whenStable()`.

## Do / Don't

- **Do** extract per-item rules into a named `schema<Item>()` and apply with
  `applyEach(path.items, itemSchema)` - that is real reuse and is the justified
  place to reach for `schema()`.
- **Do** read the item's own siblings with `valueOf(item.id)` when a rule (like a
  per-topping max) depends on other data in the same row.
- **Do** bind the **array-item** field to your error component and read
  `errorSummary()` to roll up child errors; reserve `errors()` for single leaves.
- **Do** index rows in tests through an `itemOf(form, id)` helper keyed on a stable
  id, and `track` a stable id in the `@for`.
- **Don't** hand-write a per-index loop of `validate` calls; `applyEach` applies
  one schema to all elements and keeps rows validating independently.
- **Don't** hardcode array positions (`toppings[2]`) in specs; positions drift when
  the seed list changes.
