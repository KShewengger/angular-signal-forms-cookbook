# Conditional Logic in Signal Forms

How to make validation, field state, and whole subtrees react to other field
values with `@angular/forms/signals`. Grounded in recipe `08-conditional-validation`
(a cinema booking) and `10-dynamic-forms` (a role-based application form).

All of these are **schema-side** APIs: call them inside the SchemaFn you pass to
`form(model, schemaFn)`, not in the component. The component only reads field state
(`.disabled()`, `.value()`, `.valid()`).

---

## `applyWhen` - gate rules on an arbitrary condition

Use `applyWhen(path, ({ valueOf }) => cond, subSchema)` when a rule should only
apply while some predicate over the model is true. The condition receives a context
with `valueOf`, which reads any field's current value.

From `08` `app.schema.ts` - require a combo size only once snacks are added:

```ts
applyWhen(
  path,
  ({ valueOf }) => valueOf(path.addSnacks),
  (path) => required(path.comboSize),
);
```

The nested callback gets its own `path`; add whatever rules belong to that branch.

## `applyWhenValue` - narrow a union, then apply rules to the active variant

Use `applyWhenValue(path, predicate, subSchema)` when the condition is a **type
guard** on the field's value. The framework narrows the value type, so inside the
callback the `path` is typed to the matched variant and its variant-only fields are
reachable.

From `08` - the `experience` field is a discriminated union; apply IMAX rules only
when it is the IMAX variant:

```ts
applyWhenValue(path.experience, isImaxExperience, (imax) => {
  required(imax.glasses);
  min(imax.glasses, 1);
});

applyWhenValue(path.experience, isVipExperience, (vip) => required(vip.mealChoice));
```

`applyWhenValue` can also narrow the **root**. From `10`, the whole `Application`
is a union on `role`, so the designer-only `portfolio` rules hang off `path`:

```ts
applyWhenValue(path, isDesignerApplication, (designer) => {
  required(designer.portfolio, { message: 'Portfolio URL is required.' });
  pattern(designer.portfolio, /^https?:\/\/.+\..+/i, { message: 'Enter a valid URL.' });
});
```

`applyWhen` vs `applyWhenValue`: reach for `applyWhenValue` whenever the gate is a
type guard on the field being gated (it narrows the type for you). Use `applyWhen`
for cross-field conditions that read _other_ paths via `valueOf`.

---

## Field-state helpers: `disabled`, `hidden`, `readonly`

These set presentational/interaction state from the schema. Each takes `(path, fn)`
or `(path, { when })`. The `when`/predicate receives the same `{ valueOf }` context.

`disabled` - from `08`, lock the promo code until there are 4+ tickets:

```ts
disabled(path.promoCode, {
  when: ({ valueOf }) => valueOf(path.tickets).length < 4,
});
```

The component reads it straight off the field: `this.bookingForm.promoCode().disabled()`.

`disabled` + `hidden` - from `06` `app.schema.ts`, per array item. `disabled` caps a
counter at its max; `hidden` cross-references a sibling item in the same array:

```ts
disabled(item.count, {
  when: ({ valueOf }) => valueOf(item.count) >= (PIZZA_TOPPINGS_MAP[valueOf(item.id)]?.max ?? 0),
});

// inside applyEach(path.toppings, (topping) => { ... })
hidden(topping.count, {
  when: ({ valueOf }) => {
    if (valueOf(topping.id) !== 'pepperoni') return false;
    const tomato = valueOf(path.toppings).find((t) => t.id === 'tomato');
    return (tomato?.count ?? 0) > 1;
  },
});
```

`readonly(path, fn)` follows the identical shape. A custom control surfaces these as
inputs (`disabled`, `readonly`, `hidden` in `06`'s `Topping`) and styles itself from
them; the framework wires the state through automatically when the field is bound.

---

## Discriminated-union variants: guard next to the type, cast in one place

A union field (like `Experience` or `Application`) needs three pieces, and the
cookbook keeps each in exactly one home.

**1. The narrowing type guard lives next to the type** in `app.model.ts`, never
inline at the call site:

```ts
export type Experience = { format: 'standard' } | { format: 'imax'; glasses: number | null } | { format: 'vip'; mealChoice: string };

export function isImaxExperience(e: Experience): e is ImaxExperience {
  return e.format === 'imax';
}
```

The schema (`applyWhenValue`) can consume these guards directly, because it narrows
the _value_.

**2. Reading a variant's own field from a `FieldTree` needs one cast.** A type guard
narrows a value, but it **cannot narrow a `FieldTree`** - `bookingForm.experience`
is a `FieldTree<Experience>` regardless of the current value, and TypeScript will not
let you reach `.glasses` on it. Contain that single unavoidable cast in a
`variantOf` helper in `app.utils.ts`, which checks the guard first and throws if the
variant is not active:

```ts
export function variantOf<TUnion, TVariant extends TUnion>(field: FieldTree<TUnion>, isVariant: (value: TUnion) => value is TVariant, variantName: string): FieldTree<TVariant> {
  if (!isVariant(field().value())) {
    throw new Error(`Read the ${variantName} variant while it was not active.`);
  }
  return field as unknown as FieldTree<TVariant>;
}
```

**3. Components reach variant fields through the helper**, so the cast never spreads:

```ts
protected get glassesField(): FieldTree<number | null> {
  return variantOf(this.bookingForm.experience, isImaxExperience, 'imax').glasses;
}
```

The template only renders that getter inside the matching `@switch` branch
(`@case ('imax')`), so the guard's throw is a guardrail, not a hot path.

**Switching variants** happens via a `create*` factory (also in `app.utils.ts`) that
returns a fresh, fully-shaped variant object, set through the field:

```ts
this.bookingForm.experience().value.set(createExperience(format));
```

Never mutate a variant in place or `set` a partial object; build the whole variant so
its type stays sound.

---

## Do / Don't

- **Do** put conditional rules in the SchemaFn; keep the component reading state only.
- **Do** use `applyWhenValue` with a type guard when gating a union field on its own
  discriminant; use `applyWhen` for cross-field conditions read via `valueOf`.
- **Do** declare the type guard beside the type in `app.model.ts`.
- **Do** funnel the one required `FieldTree` cast through `variantOf`; guard before cast.
- **Do** rebuild a whole variant with a `create*` factory when switching.
- **Don't** inline `value.format === 'imax'` checks at each call site - name the guard.
- **Don't** cast `field as FieldTree<Variant>` in components or specs; that is exactly
  what `variantOf` exists to prevent.
- **Don't** set state (`disabled`/`hidden`/`readonly`) imperatively in the component
  when the schema can derive it from the model.
