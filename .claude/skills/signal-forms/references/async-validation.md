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
  bare string, which `validateHttp` issues as a `GET`.
- **`onSuccess`** maps the parsed response body to a validation error or `null`.
  Return `null` for valid; return `{ kind, message }` to fail. The `kind` is your
  stable error identity (`bookingNotFound`) that tests and templates key off of;
  the `message` is the human string. This is where a `200 OK` with a "not found"
  body becomes a validation error, not an exception.
- **`onError`** is the transport-failure branch: a non-2xx status, a thrown
  `HttpErrorResponse`, a dropped connection. Return a distinct `kind`
  (`networkError`) so the UI can tell "your booking does not exist" apart from
  "we could not check right now."

Pair `validateHttp` with `debounce` on the same path so you fire one request per
settled input, not one per keystroke. See `debounce-and-async-ui.md`.

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

## The field's `.pending()` state while in flight

While the request is outstanding the field is neither valid nor invalid: it is
pending. Read `field.reference().pending()` to show a spinner or gate submit, and
lean on the field's own `valid()` / `invalid()` once it resolves. Recipe 04 gates
its "Find my booking" button on `dirty() && !invalid()` so a pending or failed
check keeps submit disabled:

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
- **Don't** assert `bookingNotFound` synchronously right after `value.set(...)`;
  the resource has not resolved yet and the assertion will flake.
- **Don't** collapse a `200 OK` "does not exist" body into the `onError` branch.
  A found-but-invalid answer is `onSuccess` returning an error object; `onError`
  is for transport failures only.
- **Don't** treat cleared `invalid()` as confirmed-valid while `pending()` is
  still true; gate submit on the field state, as `canFind` does.
