import {
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Field, FieldTree, form } from '@angular/forms/signals';
import { of } from 'rxjs';
import type { Bookmark, BookmarkCollection } from '../app.model';
import { bookmarkHubSchema } from '../app.schema';
import { ValidationErrors } from './validation-errors';

function mockMicrolink(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (request.url.startsWith('https://api.microlink.io/')) {
    return of(new HttpResponse({ status: 200, body: { status: 'fail' } }));
  }

  return next(request);
}

describe('ValidationErrors (12 · Field Metadata)', () => {
  let fixture: ComponentFixture<ValidationErrors>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationErrors],
      providers: [provideHttpClient(withInterceptors([mockMicrolink]))],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationErrors);
    host = fixture.nativeElement as HTMLElement;
  });

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

  const showErrorsFor = async (field: Field<unknown>): Promise<void> => {
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  };

  describe('visibility', () => {
    it('stays hidden until the field is touched or dirty', async () => {
      const bookmarkForm = buildForm([{ id: 'a', title: '', url: '' }]);
      await showErrorsFor(bookmarkForm.bookmarks[0].url);

      expect(host.querySelector('[role="alert"]')).toBeNull();
    });

    it('shows the required error once the field is touched', async () => {
      const bookmarkForm = buildForm([{ id: 'a', title: '', url: '' }]);
      bookmarkForm.bookmarks[0].url().markAsTouched();
      await showErrorsFor(bookmarkForm.bookmarks[0].url);

      expect(host.querySelector('[role="alert"]')).not.toBeNull();
      expect(host.textContent).toContain('Add a link before saving.');
    });
  });

  describe('accessibility', () => {
    it('exposes the list as a polite alert', async () => {
      const bookmarkForm = buildForm([{ id: 'a', title: '', url: '' }]);
      bookmarkForm.bookmarks[0].url().markAsTouched();
      await showErrorsFor(bookmarkForm.bookmarks[0].url);

      const alert = host.querySelector('ul[role="alert"]');
      expect(alert?.getAttribute('aria-live')).toBe('polite');
    });
  });
});
