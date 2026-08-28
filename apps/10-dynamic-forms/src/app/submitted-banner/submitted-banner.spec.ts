import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmittedBanner } from './submitted-banner';

describe('SubmittedBanner (10 · Dynamic Forms)', () => {
  let fixture: ComponentFixture<SubmittedBanner>;
  let host: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SubmittedBanner] });
    fixture = TestBed.createComponent(SubmittedBanner);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders the success copy', () => {
    expect(host.textContent).toContain("Application sent. We'll be in touch.");
  });

  it('exposes status semantics to assistive technology', () => {
    const status = host.querySelector('[role="status"]');

    expect(status).not.toBeNull();
    expect(status?.getAttribute('aria-live')).toBe('polite');
  });

  it('emits retry when Retry is clicked', () => {
    const retries: unknown[] = [];
    fixture.componentInstance.retry.subscribe(() => retries.push(true));

    const retryButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Retry'),
    ) as HTMLButtonElement;

    retryButton.click();

    expect(retries).toHaveLength(1);
  });
});
