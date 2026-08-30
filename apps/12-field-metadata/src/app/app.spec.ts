import {
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldTree, form, MAX_LENGTH } from '@angular/forms/signals';
import { of } from 'rxjs';
import { TITLE_MAX_LENGTH } from './app.data';
import { App } from './app';
import type { Bookmark, BookmarkCollection } from './app.model';
import { PLATFORM, STATUS } from './app.metadata';
import { bookmarkHubSchema } from './app.schema';
import { toLinkPreview } from './app.utils';

function mockMicrolink(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (request.url.startsWith('https://api.microlink.io/')) {
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
      bookmarks: Bookmark[],
    ): FieldTree<BookmarkCollection> => {
      const model = signal<BookmarkCollection>({ bookmarks });
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
