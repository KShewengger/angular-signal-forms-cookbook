# Standard Schema and Zod Validation

Signal forms can drive a field's validation from an external **Standard Schema**
provider instead of hand-written validators. Reach for this when the rules already
live in a schema you own elsewhere (an API contract, a shared Zod model) and you
want one source of truth for both parse-time and form-time validation, rather than
re-expressing `required`/`email`/`min` by hand.

The bridge is `validateStandardSchema(path, schema)`. It runs the schema against the
field's value and maps every issue the schema reports back onto the field as an
error. Zod v4 is a Standard Schema provider, so it drops straight in - but nothing
here is Zod-specific: any library that implements the Standard Schema interface
(Valibot, ArkType, and others) works through the same call.

Everything below is grounded in [`apps/11-zod-schema`](https://github.com/KShewengger/angular-signal-forms-cookbook/blob/main/apps/11-zod-schema/README.md) (Support Desk ticket form).
Read `app.schema.ts` (the bridge), `app.model.ts` (the `Ticket` shape), and `app.ts`
(the form wiring) alongside this doc.

---

## The bridge: `validateStandardSchema(path, schema)`

Bind a Zod schema to a field path inside the form's schema function. The recipe
validates three fields of the `Ticket`:

```ts
// app.schema.ts
import { SchemaPathTree, validateStandardSchema } from '@angular/forms/signals';
import * as z from 'zod';
import type { Ticket } from './app.model';

export const subjectSchema = z.string().min(SUBJECT_MIN_LENGTH, `Give the ticket a subject of at least ${SUBJECT_MIN_LENGTH} characters.`);

export function ticketSchema(path: SchemaPathTree<Ticket>): void {
  validateStandardSchema(path.contact, ({ valueOf }) => contactSchema(valueOf(path.channel)));

  validateStandardSchema(path.subject, subjectSchema);

  validateStandardSchema(path.detail, ({ valueOf }) => detailSchema(valueOf(path.severity)));
}
```

Two shapes appear here:

- **A fixed schema** - pass the Zod schema object directly (`subjectSchema`). Use
  this when the rule never changes.
- **A schema factory** - pass `({ valueOf }) => zodSchema`, reading other fields
  with `valueOf` to pick the schema. Use this when the rule depends on sibling state.

Wire the form the usual way - `validateStandardSchema` is just another rule inside
the schema function:

```ts
// app.ts
protected readonly ticketModel = signal<Ticket>({ ...INITIAL_TICKET });
protected readonly ticketForm = form(this.ticketModel, ticketSchema, { /* submission */ });
```

---

## How issues map to field errors

`validateStandardSchema` runs the schema against the field value, takes the Standard
Schema **issues** it reports, and republishes them as entries in `field().errors()`.
Each mapped error carries:

- `kind: 'standardSchema'` - the discriminator for every issue that came through this
  bridge (verified in the recipe's isolated spec:
  `expect(kindsOf(ticket.contact)).toEqual(['standardSchema'])`).
- `message` - the message string from the Zod issue. Whatever you pass as the second
  argument to a Zod rule (`z.email('We need a valid email to reply.')`) is what the
  field renders.

Because these are ordinary field errors, they read through the same surface as
built-in validators and render through the same `ValidationErrors` component:

```ts
// validation-errors.ts (recipe 11)
protected readonly errors = computed(() => this.field()().errors());
protected readonly showErrors = computed(() => {
  const state = this.field()();
  return (state.dirty() || state.touched()) && state.invalid();
});
```

```html
<!-- validation-errors.html -->
@for (error of errors(); track $index) {
<li><span nbText size="xs" tone="danger">{{ error.message }}</span></li>
}
```

The dirty/touched-then-invalid gate and the `.message` read are identical to a
hand-written-validator recipe. Consumers do not care that the rule came from Zod.

---

## Swapping the schema at runtime

The factory form re-selects the Zod schema whenever the fields it reads change,
because `validateStandardSchema`'s callback is reactive - `valueOf` establishes a
dependency. The recipe swaps the **contact** schema on the reply channel and the
**detail** schema on severity:

```ts
// app.schema.ts
export function contactSchema(channel: ReplyChannel): z.ZodType<string> {
  return channel === 'email' ? z.email('We need a valid email to reply.') : z.string().regex(E164_PATTERN, 'Use international format, e.g. +639171234567.');
}

export function detailSchema(severity: Severity): z.ZodType<string> {
  const minimum = DETAIL_MIN_LENGTH[severity];
  return z.string().min(minimum, `Tell us at least ${minimum} characters so we can route this.`);
}
```

Flip the channel from email to phone and the `contact` field immediately validates
against the E.164 regex instead of the email rule; raise severity and `detail`'s
minimum length tightens. No re-subscription, no manual re-run - the callback reads
`valueOf(path.channel)` / `valueOf(path.severity)` and re-evaluates when they move.

The switch is driven from the component by writing the discriminant field. Note the
recipe resets on channel change (a phone number is not a valid email, so the old
value should not carry over) but only sets on severity change:

```ts
// app.ts
protected selectChannel(channel: ReplyChannel): void {
  if (this.submitting() || this.selectedChannel() === channel) return;
  this.ticketForm().reset({ ...INITIAL_TICKET, channel });
}

protected selectSeverity(severity: Severity): void {
  if (this.submitting() || this.selectedSeverity() === severity) return;
  this.ticketForm.severity().value.set(severity);
}
```

---

## Any Standard Schema provider works

`validateStandardSchema` targets the Standard Schema interface, not Zod. Zod v4 is
one provider; the same call accepts a Valibot or ArkType schema unchanged. The recipe
uses Zod because it is the cookbook's chosen validation library (`import * as z from
'zod'`), but the bridge is provider-agnostic - the mapping to `kind:
'standardSchema'` errors is identical whatever library produced the issues.

---

## Do / Don't

- **Do** reach for `validateStandardSchema` when the rules already live in a schema
  you own (API contract, shared model) - one source of truth beats re-typing
  `required`/`min`/`email` as built-in validators.
- **Do** put every Zod message inline in the schema (`z.email('...')`,
  `z.string().min(n, '...')`); that string is what the field renders, so an empty
  message means a blank error.
- **Do** use the factory form `({ valueOf }) => schema` when the rule depends on a
  sibling field; `valueOf` makes the selection reactive so the schema swaps on its
  own.
- **Do** extract the Zod schemas into named exports (`subjectSchema`,
  `contactSchema`, `detailSchema`) so isolated specs can build the form with
  `form(model, ticketSchema, { injector })` and assert `kind`/`message`.
- **Don't** duplicate the rules as hand-written validators alongside the Zod schema -
  pick one channel per field or they will conflict and double-report.
- **Don't** assume the error `kind` is Zod-specific; every mapped issue is
  `kind: 'standardSchema'` regardless of provider - match on that, not on a Zod name.
- **Don't** carry a stale value across a schema swap when the old value is invalid
  under the new rule - reset (as the recipe does on channel change) rather than
  leaving a phone number in an email-validated field.
