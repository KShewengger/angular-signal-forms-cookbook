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
import { HELP, TAG_HINT } from '../app.metadata';
import { bookmarkHubSchema } from '../app.schema';
import { MetadataHints } from './metadata-hints';

function mockMicrolink(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (request.url.startsWith('https://api.microlink.io/')) {
    return of(new HttpResponse({ status: 200, body: { status: 'fail' } }));
  }

  return next(request);
}

describe('MetadataHints (12 · Field Metadata)', () => {
  let fixture: ComponentFixture<MetadataHints>;
  let host: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MetadataHints],
      providers: [provideHttpClient(withInterceptors([mockMicrolink]))],
    });

    fixture = TestBed.createComponent(MetadataHints);
    host = fixture.nativeElement as HTMLElement;
  });

  const buildBookmark = (over: Partial<Bookmark>): FieldTree<Bookmark> => {
    const model = signal<BookmarkCollection>({
      bookmarks: [
        {
          id: 'a',
          title: '',
          url: '',
          priority: 3,
          tag: 'framework',
          pinned: false,
          ...over,
        },
      ],
    });

    return form(model, bookmarkHubSchema, {
      injector: TestBed.inject(Injector),
    }).bookmarks[0];
  };

  const render = async (
    field: FieldTree<string>,
    key: typeof HELP,
  ): Promise<void> => {
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('key', key);
    await fixture.whenStable();
  };

  it('reads the HELP hints straight from the url field', async () => {
    const bookmark = buildBookmark({ url: 'github.com/a/b' });

    await render(bookmark.url, HELP);

    expect(host.textContent).toContain('Links to a specific page.');
  });

  it('reads the derived TAG_HINT from the tag field', async () => {
    const bookmark = buildBookmark({ tag: 'framework' });

    await render(bookmark.tag, TAG_HINT);

    expect(host.textContent).toContain('lowercase, numbers, hyphens');
  });

  it('renders nothing when the field carries no hints', async () => {
    const bookmark = buildBookmark({ url: '' });

    await render(bookmark.url, HELP);

    expect(host.textContent?.trim()).toBe('');
  });
});
