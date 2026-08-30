import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldTree, form } from '@angular/forms/signals';
import { of } from 'rxjs';
import { MICROLINK_ENDPOINT } from '../app.data';
import type { Bookmark, BookmarkCollection } from '../app.model';
import { bookmarkHubSchema } from '../app.schema';
import { BookmarkCard } from './bookmark-card';

function microlinkInterceptor(
  outcome: 'success' | 'fail' = 'success',
): HttpInterceptorFn {
  return (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    if (!request.url.startsWith(MICROLINK_ENDPOINT)) {
      return next(request);
    }

    const body =
      outcome === 'success'
        ? {
            status: 'success',
            data: {
              title: 'Repo Preview',
              publisher: 'github.com',
              logo: { url: 'https://logo.png' },
            },
          }
        : { status: 'fail' };

    return of(new HttpResponse({ status: 200, body }));
  };
}

describe('BookmarkCard (12 · Field Metadata)', () => {
  let fixture: ComponentFixture<BookmarkCard>;
  let host: HTMLElement;

  const buildField = (over: Partial<Bookmark>): FieldTree<Bookmark> => {
    const bookmark: Bookmark = {
      id: 'a',
      title: '',
      url: '',
      priority: 3,
      tag: 'framework',
      pinned: false,
      ...over,
    };
    const model = signal<BookmarkCollection>({ bookmarks: [bookmark] });
    const bookmarkForm = form(model, bookmarkHubSchema, {
      injector: TestBed.inject(Injector),
    });

    return bookmarkForm.bookmarks[0];
  };

  const render = async (over: Partial<Bookmark>): Promise<void> => {
    fixture = TestBed.createComponent(BookmarkCard);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('field', buildField(over));
    await fixture.whenStable();
  };

  describe('component (DOM)', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BookmarkCard],
        providers: [
          provideHttpClient(withInterceptors([microlinkInterceptor()])),
        ],
      }).compileComponents();
    });

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

      expect(host.textContent).toContain('Repo Preview');
      expect(host.textContent).toContain('Repo');
    });

    it('emits remove when the remove button is clicked', async () => {
      await render({ id: 'a', title: 'Angular', url: 'github.com/a' });

      const removed = vi.fn();
      fixture.componentInstance.remove.subscribe(removed);
      const button = host.querySelector(
        'button[aria-label="Remove bookmark"]',
      ) as HTMLButtonElement;
      button.click();

      expect(removed).toHaveBeenCalledOnce();
    });

    it('aggregates derived url help hints with the list() reducer', async () => {
      await render({ id: 'a', title: '', url: 'example.org' });

      expect(host.textContent).toContain(
        'Unrecognized site, tagged as Website.',
      );
      expect(host.textContent).toContain('Points to the site homepage.');
    });

    it('flips the path hint for a recognized deep link', async () => {
      await render({ id: 'a', title: '', url: 'github.com/a/b' });

      expect(host.textContent).toContain('Links to a specific page.');
      expect(host.textContent).not.toContain('Unrecognized site');
    });

    it('reads the priority bounds from MIN_NUMBER / MAX_NUMBER metadata', async () => {
      await render({ url: 'github.com/a' });

      expect(host.textContent).toContain('1 to 5');
    });

    it('reads the tag pattern from PATTERN metadata as a readable hint', async () => {
      await render({ url: 'github.com/a' });

      expect(host.textContent).toContain('lowercase, numbers, hyphens');
    });

    it('shows the 1 to 5 ceiling and no pin note when unpinned', async () => {
      await render({ url: 'github.com/a', pinned: false });

      expect(host.textContent).toContain('1 to 5');
      expect(host.textContent).not.toContain('priority ceiling raised');
      expect(host.querySelector('nb-sticker')).toBeNull();
    });

    it('raises the ceiling to 1 to 10, shows the applyWhen note, and flags the pin when pinned', async () => {
      await render({ url: 'github.com/a', pinned: true });

      expect(host.textContent).toContain('1 to 10');
      expect(host.textContent).toContain('priority ceiling raised to 10');
      expect(host.querySelector('nb-sticker')).not.toBeNull();
    });
  });

  describe('unreachable preview', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BookmarkCard],
        providers: [
          provideHttpClient(withInterceptors([microlinkInterceptor('fail')])),
        ],
      }).compileComponents();
    });

    it('shows the error state when the managed preview cannot be fetched', async () => {
      await render({ id: 'a', title: 'Angular', url: 'github.com/a' });

      expect(host.textContent).toContain('Could not reach that site.');
    });
  });
});
