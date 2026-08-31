import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import {
  Application,
  DesignerApplication,
  isDesignerApplication,
} from '../app.model';
import { applicationSchema } from '../app.schema';
import { createApplication, variantOf } from '../app.utils';
import { DesignerForm } from './designer-form';

const VALID_DESIGNER: DesignerApplication = {
  role: 'designer',
  name: 'Kristy Mae Almuete',
  years: 5,
  engagement: { kind: 'fulltime' },
  skills: ['Angular', 'Figma', 'Sass'],
  portfolio: 'https://ada.dev',
};

const buildApplicationForm = (
  initial: Application = createApplication('designer'),
): FieldTree<Application> => {
  const model = signal<Application>({ ...initial });

  return form(model, applicationSchema, {
    injector: TestBed.inject(Injector),
  });
};

const portfolioOf = (
  applicationForm: FieldTree<Application>,
): FieldTree<string> =>
  variantOf(applicationForm, isDesignerApplication, 'designer').portfolio;

describe('DesignerForm (10 · Dynamic Forms)', () => {
  let fixture: ComponentFixture<DesignerForm>;
  let host: HTMLElement;
  let applicationForm: FieldTree<Application>;

  const engagementButton = (label: string): HTMLButtonElement =>
    Array.from(
      host
        .querySelector('[aria-labelledby="designer-engagement-label"]')
        ?.querySelectorAll('button') ?? [],
    ).find((button) =>
      button.textContent?.includes(label),
    ) as HTMLButtonElement;

  const bindForm = async (
    initial: Application = createApplication('designer'),
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
    TestBed.configureTestingModule({ imports: [DesignerForm] });
    fixture = TestBed.createComponent(DesignerForm);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders the designer fields including portfolio and skill composer', async () => {
    await bindForm();

    expect(host.querySelector('#designer-name')).toBeTruthy();
    expect(host.querySelector('#designer-portfolio')).toBeTruthy();
    expect(host.querySelector('#designer-skill')).toBeTruthy();
    expect(host.textContent).toContain('Designer application');
  });

  it('reflects the portfolio model value in the DOM', async () => {
    await bindForm(VALID_DESIGNER);

    const portfolio = host.querySelector(
      '#designer-portfolio',
    ) as HTMLInputElement;

    expect(portfolio.value).toBe(VALID_DESIGNER.portfolio);
  });

  it('updates the portfolio model when the user types', async () => {
    await bindForm();

    const portfolio = host.querySelector(
      '#designer-portfolio',
    ) as HTMLInputElement;
    portfolio.value = 'https://ada.dev';
    portfolio.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    expect(portfolioOf(applicationForm)().value()).toBe('https://ada.dev');
  });

  it('shows a required portfolio message once the field is touched', async () => {
    await bindForm();

    portfolioOf(applicationForm)().markAsTouched();
    await fixture.whenStable();

    expect(host.textContent).toContain('Portfolio URL is required.');
  });

  it('reveals and hides the day rate field with engagement', async () => {
    await bindForm();

    expect(host.querySelector('#designer-day-rate')).toBeNull();

    engagementButton('Contract').click();
    await fixture.whenStable();

    expect(host.querySelector('#designer-day-rate')).toBeTruthy();
    expect(applicationForm.engagement().value().kind).toBe('contract');

    engagementButton('Full-time').click();
    await fixture.whenStable();

    expect(host.querySelector('#designer-day-rate')).toBeNull();
  });

  it('shows the submitted banner only when submitted is true', async () => {
    await bindForm(VALID_DESIGNER, { submitted: false });
    expect(host.textContent).not.toContain('Application sent');

    fixture.componentRef.setInput('submitted', true);
    await fixture.whenStable();

    expect(host.textContent).toContain("Application sent. We'll be in touch.");
  });

  it('emits retry when the banner Retry control is clicked', async () => {
    await bindForm(VALID_DESIGNER, { submitted: true });

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
    await bindForm(VALID_DESIGNER, { submitting: true });

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
    await bindForm(VALID_DESIGNER);

    const submit = host.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    expect(submit?.disabled).toBe(false);
  });
});
