# Async Validation with `validateHttp`

Server-side checks that must hit an HTTP endpoint (does this booking reference
exist?) belong in the schema via `validateHttp`, not in component code. Recipe
`04-async-validation` verifies a booking reference against `/api/bookings/:ref`
and surfaces a `bookingNotFound` error when the server says it does not exist.

Read this before wiring any async rule. The two things people get wrong are (1)
forgetting to register `provideHttpClient`, and (2) asserting async results
synchronously in tests.

## The schema: `validateHttp`

`validateHttp(path, { request, onSuccess, onError })` lives in the same schema
function as your synchronous rules. Synchronous rules still run first and gate the
field; the HTTP request only fires once the field is otherwise valid.

```ts
// apps/04-async-validation/src/app/app.schema.ts
import { debounce, required, SchemaPathTree, validateHttp } from '@angular/forms/signals';
import { BookingFormModel } from './app.model';

export function bookingSchema(path: SchemaPathTree<BookingFormModel>): void {
  required(path.reference, {
    message: 'Please enter your booking reference.',
  });

  debounce(path.reference, 500);

  validateHttp(path.reference, {
    request: ({ value }) => `/api/bookings/${value().trim()}`,

    onSuccess: (response: { exists: boolean }) =>
      response.exists
        ? null
        : {
            kind: 'bookingNotFound',
            message: 'Booking does not exist.',
          },

    onError: () => ({
      kind: 'networkError',
      message: 'Could not verify the booking.',
    }),
  });

  required(path.lastName, {
    message: 'Please enter your last name.',
  });
}
```

- **`request`** returns the URL (or an `HttpResourceRequest`) built from the field
  value. `value()` is a signal read, so trim/normalize it here. Recipe 04 returns a
  bare string, which `validateHttp` issues as a `GET`. Return an `HttpResourceRequest`
  object for anything richer - `POST` with a body, custom headers:

  ```ts
  request: ({ value }) => ({
    url: '/api/usernames/check',
    method: 'POST',
    body: { username: value() },
  }),
  ```

  Return **`undefined`** to skip the request entirely (nothing to check, or a value
  you have already resolved) - the field is treated as valid without a round trip.

- **`onSuccess`** maps the parsed response body to a validation error or `null`.
  Return `null` for valid; return `{ kind, message }` to fail. The `kind` is your
  stable error identity (`bookingNotFound`) that tests and templates key off of;
  the `message` is the human string. This is where a `200 OK` with a "not found"
  body becomes a validation error, not an exception.
- **`onError`** is the transport-failure branch: a non-2xx status, a thrown
  `HttpErrorResponse`, a dropped connection. Return a distinct `kind`
  (`networkError`) so the UI can tell "your booking does not exist" apart from
  "we could not check right now."

Pair `validateHttp` with the schema-level `debounce(path, ms)` on the same path so you
fire one request per settled input, not one per keystroke - this is what recipe 04
does. See `debounce-and-async-ui.md`.

`validateHttp` also accepts its own **per-validator options** (all docs API, none used
by recipe 04, so treat them as additive, not the cookbook pattern):

- **`debounce`** (ms) - throttles just this validator, independent of the field-level
  `debounce()` rule. Use it when one field has several async checks you want paced
  differently; otherwise prefer the schema-level `debounce`.
- **`options`** - HTTP request options such as `headers` (an `HttpHeaders`) and
  `timeout` (ms).
- **`parse`** - types/transforms the raw response body before it reaches `onSuccess`.

## Wire `provideHttpClient` or the request never runs

`validateHttp` resolves through Angular's `HttpClient`. Register it in the app
config. Recipe 04 also installs an interceptor that fakes the backend so the recipe
is self-contained.

```ts
// apps/04-async-validation/src/app/app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { mockHttpInterceptor } from '../mock.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient(withInterceptors([mockHttpInterceptor]))],
};
```

The interceptor answers `GET /api/bookings/:ref` with `{ exists: boolean }`,
matching the `onSuccess` response shape:

```ts
// apps/04-async-validation/src/mock.interceptor.ts
export function mockHttpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (req.method === 'GET' && req.url.startsWith('/api/bookings/')) {
    const reference = req.url.split('/').pop() ?? '';
    return of(
      new HttpResponse({
        status: 200,
        body: {
          exists: ['ABC1234', 'DEF4567', 'GHI7890'].includes(reference.toUpperCase()),
        },
      }),
    );
  }
  return next(req);
}
```

## `validateAsync` - non-HTTP async validation (docs API, not in the cookbook)

When the check is not a plain HTTP call - an existing Observable service, a resource you
already own, a WebSocket, a batched lookup - reach for `validateAsync`, which exposes
Angular's resource primitive directly. Recipe 04 does not use it (its check is a single
`GET`, so `validateHttp` is the right tool); this is the escape hatch for everything
`validateHttp` cannot express. Its shape:

```ts
validateAsync(path.username, {
  params: ({ value }) => value() || undefined, // undefined skips, like request
  factory: (username) =>
    resource({
      params: () => username(),
      loader: async ({ params }) => this.users.checkAvailability(params),
    }),
  onSuccess: (available) => (available ? null : { kind: 'taken', message: 'Username is taken.' }),
  onError: () => ({ kind: 'networkError', message: 'Could not check.' }),
});
```

- **`params`** derives the resource params from the field; return `undefined` to skip.
- **`factory`** builds a resource from those params. Use `resource(...)` for a
  promise/loader, or `rxResource(...)` from `@angular/core/rxjs-interop` to adapt an
  Observable service (it subscribes and cancels for you as the value changes). Recipe 04
  uses `rxResource` in its component for a booking _lookup_, which is the same primitive
  even though that lookup is not wired as a validator.
- **`onSuccess`** / **`onError`** map the resolved value or the failure to a validation
  error or `null`, exactly as in `validateHttp`.

`validateHttp` is `validateAsync` specialized to `httpResource` - the pending, cancel,
and sync-first behavior below is identical for both.

## Sync runs first, async only on a clean field

Synchronous rules gate the request: `validateHttp` fires only once the field passes
every sync validator on that path. A `required` failure, a format failure, anything
synchronous short-circuits before any HTTP goes out, so you never spend a round trip
validating a value the client can already reject. Order your schema with the cheap
sync rules first (recipe 04 keeps `required(path.reference)` above the `validateHttp`).

## Latest-wins cancellation

`validateHttp` runs through a resource, so a new field value **cancels the in-flight
request** for that field automatically before starting the next one. You never get a
stale response landing after a newer keystroke - the framework enforces latest-wins;
you do not wire `switchMap` or an `AbortController` yourself. Debouncing still matters
(it decides _when_ a request starts), but correctness under fast typing is built in.

## The field's `.pending()` state while in flight

While the request is outstanding the field is in a distinct **pending** state, neither
valid nor invalid. Concretely, during pending:

- `pending()` is `true`
- `valid()` is `false` **and** `invalid()` is `false` (it is neither yet)
- `errors()` is empty (no verdict has arrived)
- `submit()` waits for it to settle before running the action **when
  `ignoreValidators: 'none'`** (the cookbook's submit config); the default `'pending'`
  would not wait. See `submission.md`.

Read `field.reference().pending()` to show a spinner or gate submit, and lean on the
field's own `valid()` / `invalid()` once it resolves. Because `pending()` is `true`
while a request is outstanding, a form-level `anyPending`/`pending()` read aggregates
every in-flight async check across the tree - use it to gate a whole form, not just one
field. Recipe 04 gates its "Find my booking" button on `dirty() && !invalid()` so a
pending or failed check keeps submit disabled:

```ts
// apps/04-async-validation/src/app/app.ts
protected readonly canFind = computed(() => {
  const field = this.bookingForm();
  return field.dirty() && !field.invalid();
});
```

Do not treat "not invalid" as "confirmed valid" until pending clears; that is why
the gate here is about blocking submit, not asserting success.

## Async resolves through a resource, so tests must wait

`validateHttp` runs the request through a resource under the hood. The result lands
on a microtask/timer, not synchronously after you set the value. In tests, set the
input, then `await TestBed.inject(ApplicationRef).whenStable()` before asserting the
async outcome. Synchronous rules (like `required`) you can assert immediately;
`bookingNotFound` / `networkError` you cannot.

```ts
// apps/04-async-validation/src/app/app.spec.ts
const settle = (): Promise<void> => TestBed.inject(ApplicationRef).whenStable();

const buildBookingForm = (initial: Partial<BookingFormModel> = {}): FieldTree<BookingFormModel> => {
  const model = signal<BookingFormModel>({ ...INITIAL_BOOKING, ...initial });
  return form(model, bookingSchema, { injector: TestBed.inject(Injector) });
};

// isolated suite must still provide HttpClient - validateHttp needs it
beforeEach(() =>
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptors([mockHttpInterceptor]))],
  }),
);

it('is required synchronously, before any request', () => {
  const bookingForm = buildBookingForm();
  // no settle() needed - required is synchronous
  expect(bookingForm.reference().valid()).toBe(false);
});

it('rejects an unknown reference with bookingNotFound', async () => {
  const bookingForm = buildBookingForm({ reference: 'ZZZ0000' });
  await settle(); // wait for the resource to resolve
  expect(
    bookingForm
      .reference()
      .errors()
      .map((e) => e.kind),
  ).toContain('bookingNotFound');
  expect(bookingForm.reference().valid()).toBe(false);
});
```

Test the `onError` branch by swapping in a failing interceptor that throws an
`HttpErrorResponse`, then asserting the `networkError` kind after `settle()`:

```ts
const failingInterceptor: HttpInterceptorFn = () => throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }));

// ...configure TestBed with withInterceptors([failingInterceptor])
it('surfaces networkError when the check cannot complete', async () => {
  const bookingForm = buildBookingForm({ reference: 'ABC1234' });
  await settle();
  expect(
    bookingForm
      .reference()
      .errors()
      .map((e) => e.kind),
  ).toContain('networkError');
});
```

Note the isolated form is built with `{ injector: TestBed.inject(Injector) }` so it
resolves `HttpClient` from the testing injector.

## Do / Don't

- **Do** register `provideHttpClient(...)` in both the app config and any test
  TestBed that exercises `validateHttp`. Without it the request never issues and
  the field sits pending forever.
- **Do** give `onSuccess`-failure and `onError` distinct `kind`s
  (`bookingNotFound` vs `networkError`) so the UI and tests can distinguish "not
  found" from "could not check."
- **Do** `await TestBed.inject(ApplicationRef).whenStable()` (or
  `fixture.whenStable()` in DOM tests) before asserting any async error.
- **Do** `debounce` the same path so you fire one request per settled value.
- **Do** put cheap synchronous rules (`required`, format) above `validateHttp` so a
  bad value never spends a round trip; async runs only on an otherwise-valid field.
- **Do** return `undefined` from `request` (or `validateAsync`'s `params`) to skip a
  check you do not need to make.
- **Do** reach for `validateHttp` first for REST checks; drop to `validateAsync` only
  when the source is not a single HTTP call (Observable service, owned resource).
- **Don't** hand-roll `switchMap`/`AbortController` cancellation; `validateHttp` and
  `validateAsync` cancel the in-flight request on value change (latest-wins) for you.
- **Don't** assert `bookingNotFound` synchronously right after `value.set(...)`;
  the resource has not resolved yet and the assertion will flake.
- **Don't** collapse a `200 OK` "does not exist" body into the `onError` branch.
  A found-but-invalid answer is `onSuccess` returning an error object; `onError`
  is for transport failures only.
- **Don't** treat cleared `invalid()` as confirmed-valid while `pending()` is
  still true; gate submit on the field state, as `canFind` does.
