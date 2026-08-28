import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import { INITIAL_SEARCH, SearchFormModel } from './app.model';
import { searchSchema } from './app.schema';
import { ALLOWED_FRUITS } from './app.data';

type ErrorReader = () => {
  errors(): ReadonlyArray<{ kind: string; message?: string }>;
};

const messagesOf = (field: ErrorReader): ReadonlyArray<string | undefined> =>
  field()
    .errors()
    .map((error) => error.message);

const kindsOf = (field: ErrorReader): ReadonlyArray<string> =>
  field()
    .errors()
    .map((error) => error.kind);

const buildSearchForm = (
  initial: Partial<SearchFormModel> = {},
): FieldTree<SearchFormModel> => {
  const model = signal<SearchFormModel>({ ...INITIAL_SEARCH, ...initial });

  return form(model, searchSchema, { injector: TestBed.inject(Injector) });
};

describe('App (07 · Debounce Input)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    describe('query', () => {
      it('accepts an empty query (which lists every fruit)', () => {
        const searchForm = buildSearchForm();

        expect(searchForm.query().valid()).toBe(true);
      });

      it('accepts a query that matches a known fruit', () => {
        const searchForm = buildSearchForm({ query: 'Apple' });

        expect(searchForm.query().valid()).toBe(true);
      });

      it('matches case-insensitively and on partial input', () => {
        const searchForm = buildSearchForm({ query: 'app' });

        expect(searchForm.query().valid()).toBe(true);
      });

      it('rejects special characters with the pattern rule', () => {
        const searchForm = buildSearchForm({ query: 'a@b' });

        expect(searchForm.query().valid()).toBe(false);
        expect(kindsOf(searchForm.query)).toContain('pattern');
        expect(messagesOf(searchForm.query)).toContain(
          'No special characters allowed.',
        );
      });

      it('rejects a query that matches no fruit with unknownFruit', () => {
        const searchForm = buildSearchForm({ query: 'xyz' });

        expect(searchForm.query().valid()).toBe(false);
        expect(kindsOf(searchForm.query)).toContain('unknownFruit');
        expect(messagesOf(searchForm.query)).toContain(
          `Try one of: ${ALLOWED_FRUITS}.`,
        );
      });

      it('does not raise unknownFruit while the pattern is violated', () => {
        const searchForm = buildSearchForm({ query: 'a@b' });

        expect(kindsOf(searchForm.query)).not.toContain('unknownFruit');
      });
    });

    describe('form as a whole', () => {
      it('is valid when the query is empty', () => {
        const searchForm = buildSearchForm();

        expect(searchForm().valid()).toBe(true);
      });

      it('is invalid when the query matches no fruit', () => {
        const searchForm = buildSearchForm({ query: 'xyz' });

        expect(searchForm().valid()).toBe(false);
        expect(searchForm().invalid()).toBe(true);
      });
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const DEBOUNCE_MS = 400;
    const SEARCH_DELAY_MS = 600;

    // Fields are protected; read them through a narrow cast.
    const searchForm = (): FieldTree<SearchFormModel> =>
      (
        fixture.componentInstance as unknown as {
          searchForm: FieldTree<SearchFormModel>;
        }
      ).searchForm;

    // The lesson badge is also an nbCallout; scope to the background-tone rows.
    const fruitRows = (): NodeListOf<Element> =>
      host.querySelectorAll('[nbCallout][tone="background"]');

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('renders the search input and status badges', () => {
      expect(host.querySelector('input')).toBeTruthy();
      expect(host.textContent).toContain('Loading');
      expect(host.textContent).toContain('Resolved');
    });

    it('shows the pattern message after a special-character query is touched', async () => {
      searchForm().query().value.set('a@b');
      searchForm().query().markAsTouched();
      await fixture.whenStable();

      expect(host.textContent).toContain('No special characters allowed.');
    });

    it('shows the unknownFruit message after an unknown query is touched', async () => {
      searchForm().query().value.set('xyz');
      searchForm().query().markAsTouched();
      await fixture.whenStable();

      expect(host.textContent).toContain('Try one of:');
    });

    it('lists only the matching fruit once a valid query resolves', async () => {
      searchForm().query().value.set('Banana');
      await fixture.whenStable();

      expect(fruitRows().length).toBe(1);
      expect(host.textContent).toContain('Banana');
      expect(host.textContent).not.toContain('Apple');
    });

    it('debounces View→model before resolving the fruit list', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

      try {
        const input = host.querySelector('input') as HTMLInputElement;
        input.value = 'Banana';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await fixture.whenStable();

        expect(searchForm().query().controlValue()).toBe('Banana');
        expect(searchForm().query().value()).toBe('');
        // Empty model still drives the initial all-fruits result set.
        expect(fruitRows().length).toBe(10);
        expect(host.textContent).toContain('Apple');

        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
        await fixture.whenStable();

        expect(searchForm().query().value()).toBe('Banana');

        await vi.advanceTimersByTimeAsync(SEARCH_DELAY_MS);
        await fixture.whenStable();

        expect(fruitRows().length).toBe(1);
        expect(host.textContent).toContain('Banana');
        expect(host.textContent).not.toContain('Apple');
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
