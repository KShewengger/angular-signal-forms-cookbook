import {
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldTree, form } from '@angular/forms/signals';
import { of } from 'rxjs';
import type { Bookmark, BookmarkCollection } from '../app.model';
import { bookmarkHubSchema } from '../app.schema';
import { BookmarkCard } from './bookmark-card';

function mockMicrolink(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (request.url.startsWith('https://api.microlink.io/')) {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          status: 'success',
          data: {
            title: 'Fetched Title',
            publisher: 'github.com',
            logo: { url: 'https://logo.png' },
          },
        },
      }),
    );
  }

  return next(request);
}

describe('BookmarkCard (12 · Field Metadata)', () => {
  let fixture: ComponentFixture<BookmarkCard>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkCard],
      providers: [provideHttpClient(withInterceptors([mockMicrolink]))],
    }).compileComponents();
  });

  const buildField = (bookmark: Bookmark): FieldTree<Bookmark> => {
    const model = signal<BookmarkCollection>({ bookmarks: [bookmark] });
    const bookmarkForm = form(model, bookmarkHubSchema, {
      injector: TestBed.inject(Injector),
    });

    return bookmarkForm.bookmarks[0];
  };

  const render = async (bookmark: Bookmark): Promise<void> => {
    fixture = TestBed.createComponent(BookmarkCard);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('field', buildField(bookmark));
    await fixture.whenStable();
  };

  describe('component (DOM)', () => {
    it('shows the title counter from built-in maxLength metadata', async () => {
      await render({ id: 'a', title: 'Angular', url: 'github.com/a' });

      expect(host.textContent).toContain('7 / 40');
    });

    it('reports "All set." when both fields are filled', async () => {
      await render({ id: 'a', title: 'Angular', url: 'github.com/a' });

      expect(host.textContent).toContain('All set.');
    });

    it('reports "Add a link." when the url is empty', async () => {
      await render({ id: 'a', title: 'Angular', url: '' });

      expect(host.textContent).toContain('Add a link.');
    });

    it('resolves the managed preview and tags the platform', async () => {
      await render({ id: 'a', title: '', url: 'github.com/a' });

      expect(host.textContent).toContain('Fetched Title');
      expect(host.textContent).toContain('Repo');
    });

    it('emits remove when the remove button is clicked', async () => {
      await render({ id: 'a', title: 'Angular', url: 'github.com/a' });

      let removed = false;
      fixture.componentInstance.remove.subscribe(() => (removed = true));
      const button = host.querySelector(
        'button[aria-label="Remove bookmark"]',
      ) as HTMLButtonElement;
      button.click();

      expect(removed).toBe(true);
    });
  });
});
