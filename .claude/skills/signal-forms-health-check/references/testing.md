# Testing Signal Forms

How this cookbook tests Angular 22 signal forms (`@angular/forms/signals`). Grounded
in the real specs (recipes 04, 05, 07, 12) and the Angular
[Signal Forms testing guide](https://angular.dev/guide/forms/signals/testing). Follow
these patterns exactly; they are what CI runs.

Run specs with `nx test <app>` (never a bare `vitest`). Vitest is wired through
`@angular/build:unit-test` (jsdom + the Angular compiler + `setupFiles`). To run one
file: `pnpm exec nx test NN-name --include='**/foo.spec.ts'`.

---

## 1. The two-block split

Every recipe spec is split into two `describe` blocks under a top-level
`describe('App (NN · Title)')`:

- **`validation schema (isolated)`** builds the form directly, with no component and no
  DOM, and asserts on field state (`errors()`, `valid()`, `metadata()`).
- **`component (DOM)`** renders the component and asserts on what the template shows.

Keep them separate. Isolated tests are fast and prove the schema; DOM tests prove the
binding, the show-invalid gate, and accessibility. The official guide names the reason
this split works: signal forms keep most of their logic in the schema rather than the
template, so you can test the majority of form behaviour without rendering a component.
Reach for the DOM block only when a test genuinely needs the template.

### Isolated: build the form directly

Construct the form with `form(model, schemaFn, { injector: TestBed.inject(Injector) })`.
The schema function is imported from the app's `app.schema.ts` precisely so it is
testable in isolation. Wrap construction in a `buildForm` helper that takes a
`Partial<Model>` (or an array of partials) so each test states only what it cares about.

`form()` needs an injection context. Passing `{ injector: TestBed.inject(Injector) }`
supplies one; without it the `form()` call throws before the test can assert anything.
The cookbook always passes the explicit `injector` option. The official guide also
accepts wrapping the call in `TestBed.runInInjectionContext(() => form(model, schemaFn))`,
but prefer the explicit option here so the `buildForm` helper stays a plain function.

```ts
const buildBookingForm = (initial: Partial<BookingFormModel> = {}): FieldTree<BookingFormModel> => {
  const model = signal<BookingFormModel>({ ...INITIAL_BOOKING, ...initial });

  return form(model, bookingSchema, { injector: TestBed.inject(Injector) });
};
```

Reusable error readers keep assertions terse. Copy these into each spec:

```ts
const messagesOf = (field: FieldTree<string>) =>
  field()
    .errors()
    .map((error) => error.message);

const kindsOf = (field: FieldTree<string>) =>
  field()
    .errors()
    .map((error) => error.kind);
```

### DOM: render, act, await, assert

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  fixture = TestBed.createComponent(App);
  host = fixture.nativeElement as HTMLElement;
  await fixture.whenStable();
});
```

Fields on the component are `protected`. Read the form through a narrow typed cast
rather than exposing it:

```ts
const bookingForm = (): FieldTree<BookingFormModel> =>
  (
    fixture.componentInstance as unknown as {
      bookingForm: FieldTree<BookingFormModel>;
    }
  ).bookingForm;
```

---

## 2. Zoneless pattern: Act, `await whenStable()`, Assert

This is a zoneless workspace. Never call `fixture.detectChanges()`. The rhythm is
always: perform the action, `await fixture.whenStable()`, then assert.

Do:

```ts
bookingForm().reference().value.set('ABC1234');
bookingForm().reference().markAsTouched();
await fixture.whenStable();

expect(host.textContent).toContain('Please enter your booking reference.');
```

Don't:

```ts
bookingForm().reference().markAsTouched();
fixture.detectChanges(); // wrong: zoneless, and it does not flush signal effects
expect(...);
```

For async validation that settles outside the component's own change detection, await
the `ApplicationRef` instead (see section 5).

---

## 3. Assert `kind` AND `message`

When the schema attaches a custom message to a validator, assert both the error `kind`
and the `message`. Assert `kind` alone only when production has no custom message (a
bare `required()`, or a built-in `min`/`max`/`maxLength`/`pattern` with no override).

Do (schema defines the message):

```ts
expect(kindsOf(item.count)).toContain('toppingMax');
expect(messagesOf(item.count)).toContain('Max 5');
```

Do (bare validator, no custom message: kind only):

```ts
expect(kindsOf(bookmarkForm.bookmarks[0].title)).toContain('maxLength');
```

The `kindsOf` / `messagesOf` readers are the cookbook's terse shorthand. The official
guide asserts the same thing structurally with `expect.objectContaining`, and recipe 01
uses that form directly; both are correct, so match whichever the recipe already uses:

```ts
expect(registrationForm.name().errors()).toEqual([expect.objectContaining({ kind: 'required' })]);
```

Assert form-wide state through `form().valid()` / `form().invalid()`:

```ts
expect(bookmarkForm().valid()).toBe(false);
expect(bookmarkForm().invalid()).toBe(true);
```

Describe titles are stable and part of the contract: `App (NN · Title)` for the app
spec, `ValidationErrors (NN · Title)` for the errors-component spec, with inner blocks
named `validation schema (isolated)` and `component (DOM)`.

---

## 4. Debounce: isolated sets skip it, DOM tests must drive it

`debounce(path, ms)` only delays View→model (typed / `input` events). Direct
`value.set(...)` and isolated schema construction bypass the debounce entirely, so
isolated tests read the new value immediately.

A DOM test that asserts debounce must type through the control, use fake timers, and
advance by the **production ms**. Drift between the README, the `debounce(path, ms)`
call, and the timer advance is a real bug.

```ts
it('debounces View→model before resolving the fruit list', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

  try {
    const input = host.querySelector('input') as HTMLInputElement;
    input.value = 'Banana';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    expect(searchForm().query().controlValue()).toBe('Banana');
    expect(searchForm().query().value()).toBe(''); // model not updated yet

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS); // same ms as production
    await fixture.whenStable();

    expect(searchForm().query().value()).toBe('Banana');
  } finally {
    vi.useRealTimers();
  }
});
```

Note `controlValue()` (the view) versus `value()` (the model): before the debounce
fires they differ, which is exactly what the test proves. Always restore real timers in
a `finally`.

---

## 5. Async validation (`validateHttp`)

Async schema tests need a real `HttpClient` with a mock interceptor, and they settle on
the `ApplicationRef`, not the fixture:

```ts
beforeEach(() =>
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptors([mockHttpInterceptor]))],
  }),
);

const settle = (): Promise<void> => TestBed.inject(ApplicationRef).whenStable();

it('rejects an unknown booking reference with bookingNotFound', async () => {
  const bookingForm = buildBookingForm({ reference: 'ZZZ0000' });

  await settle();

  expect(kindsOf(bookingForm.reference)).toContain('bookingNotFound');
  expect(bookingForm.reference().valid()).toBe(false);
});
```

- Synchronous validators still resolve before any request, so a `required` failure is
  assertable without awaiting.
- Test the error branches too. Swap in a failing interceptor
  (`throwError(() => new HttpErrorResponse({ status: 500 }))`) to cover the `onError`
  path (`networkError`).
- **`NG0950`:** if the component has a required input, set it (`setInput`) before the
  first `whenStable()`. Reading a required input before it is set throws `NG0950`;
  awaiting stability triggers that read.

---

## 6. Managed metadata (`httpResource`): synchronous interceptor, `of(...)`

Recipe 12 resolves a link preview with `httpResource`. Test it with a **synchronous**
interceptor that returns `of(new HttpResponse(...))`. Do **not** use
`provideHttpClientTesting` here: it leaves the request pending until you flush it, and
because `httpResource` is awaited through `whenStable()`, a pending request hangs the
test forever.

```ts
function mockMicrolink(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (request.url.startsWith(environment.microlinkEndpoint)) {
    return of(
      new HttpResponse({
        status: 200,
        body: { status: 'success', data: { title: 'Repo Preview' /* … */ } },
      }),
    );
  }

  return next(request);
}

const HTTP = [provideHttpClient(withInterceptors([mockMicrolink]))];
```

Then the resolved preview shows up after a plain `await fixture.whenStable()`:

```ts
it('resolves the managed Microlink preview into the card', () => {
  expect(host.textContent).toContain('Repo Preview');
});
```

Match against `environment.microlinkEndpoint` (imported from `../environments/environment`),
not a hard-coded URL: the endpoint lives in `environments/` and the test must track it.

### Asserting metadata

Field metadata is read off field state with `metadata(TOKEN)?.()` (the token maps to a
signal). Built-in tokens come from `@angular/forms/signals`
(`MAX_LENGTH`, `MIN_NUMBER`, `MAX_NUMBER`, `PATTERN`); custom tokens are the app's own.

```ts
expect(title.metadata(MAX_LENGTH)?.()).toBe(TITLE_MAX_LENGTH);
expect(priority.metadata(MIN_NUMBER)?.()).toBe(PRIORITY_MIN);
expect(bookmarkForm.bookmarks[0].url().metadata(PLATFORM)?.()).toBe('repo');
```

Conditional metadata (`applyWhen`) is absent, not empty, when the condition is false:

```ts
expect(normal.bookmarks[0]().metadata(PIN_NOTE)?.()).toBeUndefined();
expect(pinned.bookmarks[0]().metadata(PIN_NOTE)?.()).toBeTruthy();
```

---

## 7. Arrays: bind ValidationErrors to the item, assert `errorSummary()`

For array recipes, index into the item field with a helper and assert its state. Leaf
fields expose `errors()`; group / array-item fields expose `errorSummary()`.

```ts
const itemOf = (pizzaForm: FieldTree<PizzaFormModel>, id: PizzaToppingId): FieldTree<PizzaFormModelItem> => {
  const index = PIZZA_TOPPINGS.findIndex((topping) => topping.id === id);

  return pizzaForm.toppings[index];
};

it('keeps a valid item valid while a sibling is invalid', () => {
  const pizzaForm = buildPizzaForm({ pepperoni: 3, mozzarella: 2 });

  expect(itemOf(pizzaForm, 'pepperoni').count().valid()).toBe(true);
  expect(itemOf(pizzaForm, 'mozzarella').count().valid()).toBe(false);
});
```

Index by id (`bookmarks[0]`, `toppings[index]`) in isolated tests; drive the visible
error through the control in DOM tests (`item.count().value.set(6)`,
`item.count().markAsTouched()`, `await whenStable()`, assert the message text).

The standalone `ValidationErrors` component is tested via `setInput('field', field)`.
Build a form, mark the field, set the input, await, then assert on `[role="alert"]`:

```ts
const showErrorsFor = async (field: Field<unknown>): Promise<void> => {
  fixture.componentRef.setInput('field', field);
  await fixture.whenStable();
};

it('stays hidden until the field is touched or dirty', async () => {
  const bookmarkForm = buildForm([{ url: '' }]);
  await showErrorsFor(bookmarkForm.bookmarks[0].url);

  expect(host.querySelector('[role="alert"]')).toBeNull();
});
```

---

## 8. i18n and NbDialog wiring in `test-setup.ts`

Data and templates use `$localize` / `i18n=`, so tests must load the localize runtime.
Each app's `src/test-setup.ts` imports it:

```ts
import '@angular/localize/init';
```

Wire it through **`setupFiles`** in the app's test target (`project.json`), **not**
`polyfills` (which is invalid on the unit-test builder). Also keep
`"types": ["@angular/localize"]` in the app's `tsconfig.app.json`; an empty `types: []`
drops localize from the app compile.

jsdom does not implement the native `<dialog>` methods (`show` / `showModal` / `close`)
that ng-brutalism's `NbDialog` calls, so any dialog-driven test throws. Stub them in
`test-setup.ts` for recipes that open a dialog:

```ts
const dialogProto = globalThis.HTMLDialogElement?.prototype;

if (dialogProto) {
  if (!dialogProto.show) {
    dialogProto.show = function (this: HTMLDialogElement): void {
      this.open = true;
    };
  }
  if (!dialogProto.showModal) {
    dialogProto.showModal = function (this: HTMLDialogElement): void {
      this.open = true;
    };
  }
  if (!dialogProto.close) {
    dialogProto.close = function (this: HTMLDialogElement): void {
      this.open = false;
    };
  }
}
```

---

## 9. Gotcha: an `<input value>` is not in `textContent`

A rendered input's value lives in its `value` property, not the DOM text, so
`host.textContent` will not contain it. Distinguish rendered fields by other visible
text: a character counter, a label, a badge. Recipe 12 tells two cards apart by their
counters, not their title inputs:

```ts
const cards = host.querySelectorAll('nb-card');

expect(cards[0].textContent).toContain('0 / 40');
expect(cards[1].textContent).toContain('17 / 40');
```

When you must read a control's value, query the element and read `.value`
(`host.querySelector('input')!.value`) rather than searching `textContent`.

---

## 10. Coverage checklist per recipe

- `validation schema (isolated)`: every validator (kind + message where defined), the
  form-as-a-whole valid/invalid transitions, and any metadata the schema publishes.
- `component (DOM)`: renders, the show-invalid gate flips on touch/dirty, key
  interactions (add/remove item, submit), and accessibility (`role="alert"`,
  `aria-live="polite"`).
- Async recipes: the resolve branch, the reject branch, and the network-error branch.
- Pure mappers / helpers (`toLinkPreview`, `patternHint`) get their own small
  `describe` with success and failure cases.
