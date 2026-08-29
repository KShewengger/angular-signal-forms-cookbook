import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { App } from './app';
import type { LinkPreview } from './app.model';
import { UnfurlService } from './unfurl.service';

class StubUnfurlService {
  preview(): Observable<LinkPreview> {
    return of({ domain: 'example.com', title: 'Example', imageUrl: null });
  }
}

describe('App (12 · Field Metadata)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: UnfurlService, useClass: StubUnfurlService }],
    }).compileComponents();
  });

  it('renders the app', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Bookmark Hub');
  });
});
