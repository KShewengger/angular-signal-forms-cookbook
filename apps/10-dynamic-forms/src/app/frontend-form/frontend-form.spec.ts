import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import { INITIAL_APPLICATION } from '../app.data';
import { Application } from '../app.model';
import { applicationSchema } from '../app.schema';
import { FrontendForm } from './frontend-form';

const VALID_FRONTEND: Application = {
  role: 'frontend',
  name: 'Kristy Mae Almuete',
  years: 5,
  engagement: { kind: 'fulltime' },
  skills: ['Angular', 'TypeScript', 'RxJS'],
};

const buildApplicationForm = (
  initial: Application = { ...INITIAL_APPLICATION },
): FieldTree<Application> => {
  const model = signal<Application>({ ...initial });

  return form(model, applicationSchema, {
    injector: TestBed.inject(Injector),
  });
};

describe('FrontendForm (10 · Dynamic Forms)', () => {
  let fixture: ComponentFixture<FrontendForm>;
  let host: HTMLElement;
  let applicationForm: FieldTree<Application>;

  const engagementButton = (label: string): HTMLButtonElement =>
    Array.from(
      host
        .querySelector('[aria-labelledby="frontend-engagement-label"]')
        ?.querySelectorAll('button') ?? [],
    ).find((button) =>
      button.textContent?.includes(label),
    ) as HTMLButtonElement;

  const bindForm = async (
    initial: Application = { ...INITIAL_APPLICATION },
    options: { submitting?: boolean; submitted?: boolean } = {},
  ): Promise<void> => {
    applicationForm = buildApplicationForm(initial);
    fixture.componentRef.setInput('form', applicationForm);
    fixture.componentRef.setInput('submitting', options.submitting ?? false);
    fixture.componentRef.setInput('submitted', options.submitted ?? false);
    fixture.componentRef.setInput('resetToken', 0);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [FrontendForm] });
    fixture = TestBed.createComponent(FrontendForm);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders the frontend fields and skill composer, without a portfolio', async () => {
    await bindForm();

    expect(host.querySelector('#frontend-name')).toBeTruthy();
    expect(host.querySelector('#frontend-years')).toBeTruthy();
    expect(host.querySelector('#frontend-skill')).toBeTruthy();
    expect(
      host.querySelector('[aria-labelledby="frontend-engagement-label"]'),
    ).toBeTruthy();
    expect(host.querySelector('#designer-portfolio')).toBeNull();
    expect(host.textContent).toContain('Frontend application');
  });

  it('reflects model values in the DOM', async () => {
    await bindForm(VALID_FRONTEND);

    const name = host.querySelector('#frontend-name') as HTMLInputElement;
    const years = host.querySelector('#frontend-years') as HTMLInputElement;

    expect(name.value).toBe(VALID_FRONTEND.name);
    expect(years.value).toBe(String(VALID_FRONTEND.years));
  });

  it('updates the model when the user types a name', async () => {
    await bindForm();

    const name = host.querySelector('#frontend-name') as HTMLInputElement;
    name.value = 'Kristy Mae Almuete';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    expect(applicationForm.name().value()).toBe('Kristy Mae Almuete');
  });

  it('reveals and hides the day rate field with engagement', async () => {
    await bindForm();

    expect(host.querySelector('#frontend-day-rate')).toBeNull();

    engagementButton('Contract').click();
    await fixture.whenStable();

    expect(host.querySelector('#frontend-day-rate')).toBeTruthy();
    expect(applicationForm.engagement().value().kind).toBe('contract');

    engagementButton('Full-time').click();
    await fixture.whenStable();

    expect(host.querySelector('#frontend-day-rate')).toBeNull();
    expect(applicationForm.engagement().value().kind).toBe('fulltime');
  });

  it('shows a required message after an empty name is touched', async () => {
    await bindForm();

    applicationForm.name().markAsTouched();
    await fixture.whenStable();

    expect(host.textContent).toContain('Name is required.');
  });

  it('shows the submitted banner only when submitted is true', async () => {
    await bindForm(VALID_FRONTEND, { submitted: false });
    expect(host.textContent).not.toContain('Application sent');

    fixture.componentRef.setInput('submitted', true);
    await fixture.whenStable();

    expect(host.textContent).toContain("Application sent. We'll be in touch.");
  });

  it('emits retry when the banner Retry control is clicked', async () => {
    await bindForm(VALID_FRONTEND, { submitted: true });

    const retries: unknown[] = [];
    fixture.componentInstance.retry.subscribe(() => retries.push(true));

    const retryButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Retry'),
    ) as HTMLButtonElement;

    retryButton.click();
    await fixture.whenStable();

    expect(retries).toHaveLength(1);
  });

  it('marks the form busy and disables the fieldset while submitting', async () => {
    await bindForm(VALID_FRONTEND, { submitting: true });

    const formEl = host.querySelector('form');
    const fieldset = host.querySelector('fieldset');

    expect(formEl?.getAttribute('aria-busy')).toBe('true');
    expect(fieldset?.disabled).toBe(true);
  });

  it('disables submit while the application is invalid', async () => {
    await bindForm();

    const submit = host.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    expect(submit?.disabled).toBe(true);
  });

  it('enables submit once the application is valid', async () => {
    await bindForm(VALID_FRONTEND);

    const submit = host.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    expect(submit?.disabled).toBe(false);
  });
});
