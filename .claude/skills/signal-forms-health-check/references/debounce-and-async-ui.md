# Debounce and Live-Search UI

`debounce(path, ms)` delays how fast typed input flows from the view into the model,
so validation and downstream searches settle instead of firing on every keystroke.
Recipe `07-debounce-input` is a live fruit search: the query field is debounced at
400ms, its settled value feeds an `rxResource` search, and status badges reflect
loading vs resolved.

The single most important rule is below. Get it wrong and both your production timing
and your tests will be subtly broken.

## CRITICAL: `debounce` only delays View→model

`debounce(path, ms)` delays the propagation of **typed/`input` events** (the view)
into the model signal. It does **not** delay anything else:

- **Direct `value.set(...)`** writes straight to the model, bypassing the debounce
  entirely. There is no wait.
- **Isolated schema tests** that seed the model (`signal<Model>({ query: 'Apple' })`)
  or call `value.set(...)` see the value immediately; they never observe the delay
  and must not try to.

So the debounce is only visible when input arrives through the bound control as an
`input` event. Keep that distinction front of mind when reading state and when
writing tests.

## The schema: `debounce` alongside sync rules

```ts
// apps/07-debounce-input/src/app/app.schema.ts
import { debounce, pattern, SchemaPathTree, validate } from '@angular/forms/signals';
import { ALLOWED_FRUITS, FRUITS, QUERY_PATTERN } from './app.data';
import { SearchFormModel } from './app.model';

export function searchSchema(path: SchemaPathTree<SearchFormModel>): void {
  pattern(path.query, QUERY_PATTERN, {
    message: 'No special characters allowed.',
  });

  validate(path.query, ({ value }) => {
    const raw = value();
    const q = raw.trim().toLowerCase();
    if (!q || !QUERY_PATTERN.test(raw)) return null;
    return FRUITS.some((fruit) => fruit.name.toLowerCase().includes(q)) ? null : { kind: 'unknownFruit', message: `Try one of: ${ALLOWED_FRUITS}.` };
  });

  debounce(path.query, 400);
}
```

The `400` here is the contract. It must match the fake-timer advance in the DOM test
and any figure quoted in the README. Drift between them (e.g. debouncing 400 but
advancing 300 in a test) is a real bug, not a rounding detail.

## Feed the debounced value into a live `rxResource`

The search resource keys off the field's **model** value, which is the debounced
one. The `params` computed returns `undefined` while the query is invalid so the
resource does not fire on junk input; when valid it passes the trimmed query.

```ts
// apps/07-debounce-input/src/app/app.ts
private readonly fruitSearch = inject(FruitSearch);
private readonly searchModel = signal<SearchFormModel>({ ...INITIAL_SEARCH });

protected readonly searchForm = form(this.searchModel, searchSchema);
protected readonly query = computed(() => this.searchForm().value().query);

private readonly searchResource = rxResource({
  params: () => (this.searchForm.query().valid() ? this.query().trim() : undefined),
  stream: ({ params }) => this.fruitSearch.search(params),
});

protected readonly status = this.searchResource.status;
protected readonly results = computed(() =>
  this.searchResource.hasValue() ? (this.searchResource.value() ?? []) : [],
);
```

Because `params` reads the debounced model value, the network call is naturally
throttled: type quickly and only the settled query reaches `fruitSearch.search`.
The service itself adds transport latency (`delay(600)`), which is separate from the
debounce and matters when timing tests (see below).

```ts
// apps/07-debounce-input/src/app/fruit-search.service.ts
@Service()
export class FruitSearch {
  search(query: string): Observable<Fruit[]> {
    const q = query.trim().toLowerCase();
    const matches = FRUITS.filter((f) => f.name.toLowerCase().includes(q));
    return of(matches).pipe(delay(600));
  }
}
```

## Template: bind the control, gate the message on field state

Bind the raw `FormField`; the debounce is applied by the schema, not the template.
Gate the error display with `@let` on field state (never an impure pipe on the
stable `Field`).

```html
<!-- apps/07-debounce-input/src/app/app.html -->
@let query = searchForm.query(); @let queryInvalid = (query.dirty() || query.touched()) && query.invalid();

<nb-input-group>
  <input nbInput placeholder="Search a fruit..." [formField]="searchForm.query" />
</nb-input-group>

<app-validation-errors [errors]="queryErrors()" [visible]="queryInvalid" />
```

## Testing debounce: fake timers, type via the control, same ms

To observe the debounce you must let a real `input` event flow through the control
and then advance fake timers by the **production** ms. Reading the field split is the
proof: right after typing, `controlValue()` is the typed text but the model
`value()` still holds the old value; only after advancing the debounce window does
`value()` catch up.

```ts
// apps/07-debounce-input/src/app/app.spec.ts
const DEBOUNCE_MS = 400; // must equal debounce(path.query, 400)
const SEARCH_DELAY_MS = 600; // must equal the service's delay(600)

it('debounces View→model before resolving the fruit list', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  try {
    const input = host.querySelector('input') as HTMLInputElement;
    input.value = 'Banana';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    // View has the text; model has NOT caught up yet.
    expect(searchForm().query().controlValue()).toBe('Banana');
    expect(searchForm().query().value()).toBe('');

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    await fixture.whenStable();
    expect(searchForm().query().value()).toBe('Banana'); // model settled

    await vi.advanceTimersByTimeAsync(SEARCH_DELAY_MS);
    await fixture.whenStable();
    expect(host.textContent).toContain('Banana');
    expect(host.textContent).not.toContain('Apple');
  } finally {
    vi.useRealTimers();
  }
});
```

Two separate timers advance here: `DEBOUNCE_MS` (400) settles View→model, then
`SEARCH_DELAY_MS` (600) resolves the `rxResource` stream. They are independent; skip
either and the assertions fail. Restore real timers in `finally`.

Tests that do **not** care about debounce (asserting validation, or asserting the
resolved result list) set the value directly with `value.set(...)` and just
`await fixture.whenStable()` - no fake timers, because a direct set bypasses the
debounce:

```ts
it('lists only the matching fruit once a valid query resolves', async () => {
  searchForm().query().value.set('Banana'); // bypasses debounce
  await fixture.whenStable();
  expect(host.textContent).toContain('Banana');
});
```

Isolated schema tests likewise seed the model and assert synchronously; the
`pattern`/`unknownFruit` rules do not involve the debounce at all.

## Do / Don't

- **Do** keep the `debounce(path, ms)` value, the test's `advanceTimersByTimeAsync`
  ms, and the README figure in lockstep. Drift is a real, silent bug.
- **Do** type through the bound control (set `input.value`, dispatch a bubbling
  `input` event) when a test must observe the debounce, and advance fake timers by
  the production ms.
- **Do** advance the resource's transport delay (600 here) as a separate step after
  the debounce settles.
- **Do** gate the resource on the field being valid (`params` returns `undefined`
  otherwise) so junk input never fires a request.
- **Don't** expect `value.set(...)` to wait - it writes straight to the model and
  skips the debounce. Use it precisely when you want to bypass timing.
- **Don't** add debounce logic to isolated schema tests; they seed the model and
  never see View→model propagation.
- **Don't** read `value()` right after typing and expect the typed text; read
  `controlValue()` for the pre-debounce view value, `value()` for the settled model.
