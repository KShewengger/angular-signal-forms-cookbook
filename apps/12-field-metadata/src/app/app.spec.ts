import {
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FieldTree,
  form,
  MAX_LENGTH,
  MAX_NUMBER,
  MIN_NUMBER,
  PATTERN,
} from '@angular/forms/signals';
import { of } from 'rxjs';
import {
  MICROLINK_ENDPOINT,
  PRIORITY_MAX,
  PRIORITY_MIN,
  PRIORITY_PINNED_MAX,
  TAG_PATTERN,
  TITLE_MAX_LENGTH,
} from './app.data';
import { App } from './app';
import type { Bookmark, BookmarkCollection } from './app.model';
import { PIN_NOTE, PLATFORM, STATUS } from './app.metadata';
import { bookmarkHubSchema } from './app.schema';
import { patternHint, toLinkPreview } from './app.utils';

function mockMicrolink(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (request.url.startsWith(MICROLINK_ENDPOINT)) {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          status: 'success',
          data: {
            title: 'Repo Preview',
            publisher: 'github.com',
            logo: { url: 'https://logo.png' },
          },
        },
      }),
    );
  }

  return next(request);
}

const HTTP = [provideHttpClient(withInterceptors([mockMicrolink]))];

const messagesOf = (field: FieldTree<string>) =>
  field()
    .errors()
    .map((error) => error.message);

const kindsOf = (field: FieldTree<string>) =>
  field()
    .errors()
    .map((error) => error.kind);

describe('App (12 · Field Metadata)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({ providers: HTTP }));

    const buildForm = (
      bookmarks: Partial<Bookmark>[],
    ): FieldTree<BookmarkCollection> => {
      const model = signal<BookmarkCollection>({
        bookmarks: bookmarks.map((over) => ({
          id: 'a',
          title: '',
          url: '',
          priority: 3,
          tag: 'framework',
          pinned: false,
          ...over,
        })),
      });

      return form(model, bookmarkHubSchema, {
        injector: TestBed.inject(Injector),
      });
    };

    describe('validators', () => {
      it('requires a url on every bookmark', () => {
        const bookmarkForm = buildForm([{ id: 'a', title: 'X', url: '' }]);
        const url = bookmarkForm.bookmarks[0].url;

        expect(kindsOf(url)).toContain('required');
        expect(messagesOf(url)).toContain('Add a link before saving.');
      });

      it('rejects a title over the maximum length', () => {
        const title = 'a'.repeat(TITLE_MAX_LENGTH + 1);
        const bookmarkForm = buildForm([{ id: 'a', title, url: 'x.com' }]);

        expect(kindsOf(bookmarkForm.bookmarks[0].title)).toContain('maxLength');
      });

      it('is valid when the url is present', () => {
        const bookmarkForm = buildForm([
          { id: 'a', title: '', url: 'github.com/a/b' },
        ]);

        expect(bookmarkForm.bookmarks[0].url().valid()).toBe(true);
      });

      it('rejects a priority below the minimum', () => {
        const bookmarkForm = buildForm([{ priority: PRIORITY_MIN - 1 }]);
        const priority = bookmarkForm.bookmarks[0].priority();

        expect(priority.invalid()).toBe(true);
        expect(priority.errors().map((error) => error.kind)).toContain('min');
      });

      it('rejects a priority above the maximum', () => {
        const bookmarkForm = buildForm([{ priority: PRIORITY_MAX + 1 }]);
        const priority = bookmarkForm.bookmarks[0].priority();

        expect(priority.errors().map((error) => error.kind)).toContain('max');
      });

      it('rejects a tag with invalid characters', () => {
        const bookmarkForm = buildForm([{ tag: 'Bad Tag!' }]);

        expect(kindsOf(bookmarkForm.bookmarks[0].tag)).toContain('pattern');
      });

      it('accepts an empty tag', () => {
        const bookmarkForm = buildForm([{ tag: '' }]);

        expect(bookmarkForm.bookmarks[0].tag().valid()).toBe(true);
      });
    });

    describe('form as a whole', () => {
      it('is invalid while a bookmark is missing its url', () => {
        const bookmarkForm = buildForm([{ id: 'a', title: 'Repo', url: '' }]);

        expect(bookmarkForm().valid()).toBe(false);
        expect(bookmarkForm().invalid()).toBe(true);
      });

      it('is valid once every bookmark has a url', () => {
        const bookmarkForm = buildForm([
          { id: 'a', title: 'Repo', url: 'github.com/a' },
        ]);

        expect(bookmarkForm().valid()).toBe(true);
      });
    });

    describe('built-in metadata (MAX_LENGTH)', () => {
      it('publishes the title max length', () => {
        const bookmarkForm = buildForm([{ id: 'a', title: '', url: 'x.com' }]);
        const title = bookmarkForm.bookmarks[0].title();

        expect(title.metadata(MAX_LENGTH)?.()).toBe(TITLE_MAX_LENGTH);
      });
    });

    describe('built-in metadata (MIN_NUMBER / MAX_NUMBER)', () => {
      it('publishes the priority bounds from the min/max validators', () => {
        const bookmarkForm = buildForm([{ priority: 3 }]);
        const priority = bookmarkForm.bookmarks[0].priority();

        expect(priority.metadata(MIN_NUMBER)?.()).toBe(PRIORITY_MIN);
        expect(priority.metadata(MAX_NUMBER)?.()).toBe(PRIORITY_MAX);
      });
    });

    describe('built-in metadata (PATTERN)', () => {
      it('publishes the tag pattern as a list of regexes', () => {
        const bookmarkForm = buildForm([{ tag: 'framework' }]);
        const tag = bookmarkForm.bookmarks[0].tag();

        expect(
          tag
            .metadata(PATTERN)?.()
            .map((expression) => expression.source),
        ).toContain(TAG_PATTERN.source);
      });
    });

    describe('dynamic + conditional metadata (pinned)', () => {
      it('raises the priority ceiling (MAX_NUMBER) when pinned', () => {
        const normal = buildForm([{ pinned: false }]);
        const pinned = buildForm([{ pinned: true }]);

        expect(normal.bookmarks[0].priority().metadata(MAX_NUMBER)?.()).toBe(
          PRIORITY_MAX,
        );
        expect(pinned.bookmarks[0].priority().metadata(MAX_NUMBER)?.()).toBe(
          PRIORITY_PINNED_MAX,
        );
      });

      it('contributes PIN_NOTE metadata only while pinned (applyWhen)', () => {
        const normal = buildForm([{ pinned: false }]);
        const pinned = buildForm([{ pinned: true }]);

        expect(normal.bookmarks[0]().metadata(PIN_NOTE)?.()).toBeUndefined();
        expect(pinned.bookmarks[0]().metadata(PIN_NOTE)?.()).toBeTruthy();
      });
    });

    describe('custom metadata (PLATFORM)', () => {
      it('classifies a known domain', () => {
        const bookmarkForm = buildForm([
          { id: 'a', title: '', url: 'github.com/a/b' },
        ]);

        expect(bookmarkForm.bookmarks[0].url().metadata(PLATFORM)?.()).toBe(
          'repo',
        );
      });

      it('falls back to website for an unknown domain', () => {
        const bookmarkForm = buildForm([
          { id: 'a', title: '', url: 'example.org' },
        ]);

        expect(bookmarkForm.bookmarks[0].url().metadata(PLATFORM)?.()).toBe(
          'website',
        );
      });

      it('has no platform for an empty url', () => {
        const bookmarkForm = buildForm([{ id: 'a', title: '', url: '' }]);

        expect(
          bookmarkForm.bookmarks[0].url().metadata(PLATFORM)?.(),
        ).toBeUndefined();
      });
    });

    describe('reducer metadata (STATUS)', () => {
      it('keeps the highest severity when both fields are empty', () => {
        const bookmarkForm = buildForm([{ id: 'a', title: '', url: '' }]);

        expect(bookmarkForm.bookmarks[0]().metadata(STATUS)?.()).toEqual({
          level: 'warning',
          message: 'Add a link.',
        });
      });

      it('flags a missing title as a notice when the url is set', () => {
        const bookmarkForm = buildForm([
          { id: 'a', title: '', url: 'github.com/a' },
        ]);

        expect(bookmarkForm.bookmarks[0]().metadata(STATUS)?.().level).toBe(
          'notice',
        );
      });

      it('is ok when both fields are filled', () => {
        const bookmarkForm = buildForm([
          { id: 'a', title: 'Repo', url: 'github.com/a' },
        ]);

        expect(bookmarkForm.bookmarks[0]().metadata(STATUS)?.().level).toBe(
          'ok',
        );
      });
    });
  });

  describe('url preview mapping (toLinkPreview)', () => {
    it('maps a successful Microlink response into a link preview', () => {
      const preview = toLinkPreview({
        status: 'success',
        data: {
          title: 'GitHub Repository',
          publisher: 'github.com',
          url: 'https://github.com',
          logo: { url: 'https://logo.png' },
          image: null,
        },
      });

      expect(preview).toEqual({
        domain: 'github.com',
        title: 'GitHub Repository',
        imageUrl: 'https://logo.png',
      });
    });

    it('throws when Microlink reports a failure', () => {
      expect(() => toLinkPreview({ status: 'fail' })).toThrow();
    });
  });

  describe('pattern hint mapping (patternHint)', () => {
    it('maps a known pattern to its readable label', () => {
      expect(patternHint(TAG_PATTERN)).toBe('lowercase, numbers, hyphens');
    });

    it('falls back to the raw source for an unknown pattern', () => {
      expect(patternHint(/^\d{4}$/)).toBe('^\\d{4}$');
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const addButton = (): HTMLButtonElement =>
      Array.from(host.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('Add bookmark'),
      ) as HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
        providers: HTTP,
      }).compileComponents();

      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('renders the seeded bookmark', () => {
      expect(host.querySelectorAll('nb-card').length).toBe(1);
    });

    it('resolves the managed Microlink preview into the card', () => {
      expect(host.textContent).toContain('Repo Preview');
    });

    it('adds a bookmark', async () => {
      addButton().click();
      await fixture.whenStable();

      expect(host.querySelectorAll('nb-card').length).toBe(2);
    });

    it('floats a pinned bookmark above the others', async () => {
      addButton().click();
      await fixture.whenStable();

      const form = (
        fixture.componentInstance as unknown as {
          bookmarkForm: FieldTree<BookmarkCollection>;
        }
      ).bookmarkForm;

      form.bookmarks[1].pinned().value.set(true);
      await fixture.whenStable();

      const cards = host.querySelectorAll('nb-card');

      expect(cards[0].textContent).toContain('0 / 40');
      expect(cards[1].textContent).toContain('17 / 40');
    });

    it('removes a bookmark and shows the empty state', async () => {
      const remove = host.querySelector(
        'button[aria-label="Remove bookmark"]',
      ) as HTMLButtonElement;
      remove.click();
      await fixture.whenStable();

      expect(host.querySelectorAll('nb-card').length).toBe(0);
      expect(host.textContent).toContain('No links yet');
    });
  });
});
