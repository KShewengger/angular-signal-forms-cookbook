import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App (11 · Zod Schema Validation)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('boots the recipe shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
