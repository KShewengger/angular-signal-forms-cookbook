import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App (02 · Built-in Validations)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('creates the component', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the registration form with its core controls', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('#registration-title')?.textContent).toContain(
      'Registration',
    );
    expect(host.querySelector('#username')).toBeTruthy();
    expect(host.querySelector('#email')).toBeTruthy();
  });
});
