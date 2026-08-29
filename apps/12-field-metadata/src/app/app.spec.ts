import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldTree, form, MAX_LENGTH } from '@angular/forms/signals';
import { of } from 'rxjs';
import { TITLE_MAX_LENGTH } from './app.data';
import { App } from './app';
import type { Bookmark, BookmarkCollection, LinkPreview } from './app.model';
import { PLATFORM, STATUS } from './app.metadata';
import { bookmarkHubSchema } from './app.schema';
import { UnfurlService } from './unfurl.service';

class StubUnfurlService {
  preview() {
    return of<LinkPreview>({
      domain: 'example.com',
      title: 'Example',
      imageUrl: null,
    });
  }
}

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
    beforeEach(() =>
      TestBed.configureTestingModule({
        providers: [{ provide: UnfurlService, useClass: StubUnfurlService }],
      }),
    );

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

  describe('unfurl service (Microlink)', () => {
    let service: UnfurlService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
      service = TestBed.inject(UnfurlService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('maps a Microlink response into a link preview', () => {
      let result: LinkPreview | undefined;
      service.preview('github.com/a/b').subscribe((value) => (result = value));

      const request = httpMock.expectOne((req) =>
        req.url.startsWith('https://api.microlink.io/'),
      );

      expect(decodeURIComponent(request.request.url)).toContain(
        'github.com/a/b',
      );
      request.flush({
        status: 'success',
        data: {
          title: 'GitHub',
          logo: { url: 'https://logo.png' },
          image: null,
        },
      });

      expect(result).toEqual({
        domain: 'github.com',
        title: 'GitHub',
        imageUrl: 'https://logo.png',
      });
    });

    it('errors for an unreachable value without calling the network', () => {
      let errored = false;
      service.preview('not a url').subscribe({ error: () => (errored = true) });

      httpMock.expectNone(() => true);
      expect(errored).toBe(true);
    });

    it('errors when Microlink reports a failure', () => {
      let errored = false;
      service
        .preview('github.com/a')
        .subscribe({ error: () => (errored = true) });

      httpMock
        .expectOne((req) => req.url.startsWith('https://api.microlink.io/'))
        .flush({ status: 'fail' });

      expect(errored).toBe(true);
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
        providers: [{ provide: UnfurlService, useClass: StubUnfurlService }],
      }).compileComponents();

      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('renders the seeded bookmark', () => {
      expect(host.querySelectorAll('nb-card').length).toBe(1);
    });

    it('resolves the managed preview into the card', async () => {
      await fixture.whenStable();

      expect(host.textContent).toContain('Example');
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
