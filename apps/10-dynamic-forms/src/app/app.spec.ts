import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import { INITIAL_APPLICATION } from './app.data';
import {
  Application,
  DesignerApplication,
  isContractEngagement,
  isDesignerApplication,
} from './app.model';
import { applicationSchema } from './app.schema';
import { createApplication, variantOf } from './app.utils';

const SUBMIT_DELAY_MS = 500;

type ErrorReader = () => {
  errors(): ReadonlyArray<{ kind: string; message?: string }>;
};

const messagesOf = (field: ErrorReader): ReadonlyArray<string | undefined> =>
  field()
    .errors()
    .map((error) => error.message);

const kindsOf = (field: ErrorReader): ReadonlyArray<string> =>
  field()
    .errors()
    .map((error) => error.kind);

const VALID_FRONTEND: Application = {
  role: 'frontend',
  name: 'Kristy Mae Almuete',
  years: 5,
  engagement: { kind: 'fulltime' },
  skills: ['Angular', 'TypeScript', 'RxJS'],
};

const VALID_DESIGNER: DesignerApplication = {
  role: 'designer',
  name: 'Kristy Mae Almuete',
  years: 5,
  engagement: { kind: 'fulltime' },
  skills: ['Angular', 'Figma', 'Sass'],
  portfolio: 'https://ada.dev',
};

const buildApplicationForm = (
  initial: Application = { ...INITIAL_APPLICATION },
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

const dayRateOf = (
  applicationForm: FieldTree<Application>,
): FieldTree<number | null> =>
  variantOf(applicationForm.engagement, isContractEngagement, 'contract')
    .dayRate;

describe('App (10 · Dynamic Forms)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    describe('name', () => {
      it('is required', () => {
        const applicationForm = buildApplicationForm();

        expect(applicationForm.name().valid()).toBe(false);
        expect(kindsOf(applicationForm.name)).toContain('required');
        expect(messagesOf(applicationForm.name)).toContain('Name is required.');
      });

      it('accepts a filled name', () => {
        const applicationForm = buildApplicationForm({
          ...INITIAL_APPLICATION,
          name: 'Kristy Mae Almuete',
        });

        expect(applicationForm.name().valid()).toBe(true);
      });
    });

    describe('years', () => {
      it('is required', () => {
        const applicationForm = buildApplicationForm();

        expect(applicationForm.years().valid()).toBe(false);
        expect(messagesOf(applicationForm.years)).toContain(
          'Years of experience is required.',
        );
      });

      it('rejects a value above 10', () => {
        const applicationForm = buildApplicationForm({
          ...INITIAL_APPLICATION,
          years: 11,
        });

        expect(applicationForm.years().valid()).toBe(false);
        expect(kindsOf(applicationForm.years)).toContain('max');
        expect(messagesOf(applicationForm.years)).toContain(
          'Keep years between 0 and 10.',
        );
      });

      it('accepts a value in range', () => {
        const applicationForm = buildApplicationForm({
          ...INITIAL_APPLICATION,
          years: 0,
        });

        expect(applicationForm.years().valid()).toBe(true);
      });
    });

    describe('engagement (applyWhenValue)', () => {
      it('does not require a day rate for fulltime', () => {
        const applicationForm = buildApplicationForm(VALID_FRONTEND);

        expect(applicationForm.engagement().valid()).toBe(true);
      });

      it('requires a day rate for contract', () => {
        const applicationForm = buildApplicationForm({
          ...VALID_FRONTEND,
          engagement: { kind: 'contract', dayRate: null },
        });

        expect(dayRateOf(applicationForm)().valid()).toBe(false);
        expect(kindsOf(dayRateOf(applicationForm))).toContain('required');
        expect(messagesOf(dayRateOf(applicationForm))).toContain(
          'Enter a day rate.',
        );
      });

      it('accepts contract once day rate is at least 1', () => {
        const applicationForm = buildApplicationForm({
          ...VALID_FRONTEND,
          engagement: { kind: 'contract', dayRate: 400 },
        });

        expect(dayRateOf(applicationForm)().valid()).toBe(true);
      });
    });

    describe('role (applyWhenValue)', () => {
      it('does not require a portfolio for frontend', () => {
        const applicationForm = buildApplicationForm(VALID_FRONTEND);

        expect(applicationForm().valid()).toBe(true);
      });

      it('requires a portfolio for designer', () => {
        const applicationForm = buildApplicationForm({
          ...VALID_DESIGNER,
          portfolio: '',
        });

        expect(portfolioOf(applicationForm)().valid()).toBe(false);
        expect(kindsOf(portfolioOf(applicationForm))).toContain('required');
        expect(messagesOf(portfolioOf(applicationForm))).toContain(
          'Portfolio URL is required.',
        );
      });

      it('rejects an invalid URL', () => {
        const applicationForm = buildApplicationForm({
          ...VALID_DESIGNER,
          portfolio: 'not-a-url',
        });

        expect(portfolioOf(applicationForm)().valid()).toBe(false);
        expect(kindsOf(portfolioOf(applicationForm))).toContain('pattern');
        expect(messagesOf(portfolioOf(applicationForm))).toContain(
          'Enter a valid URL.',
        );
      });

      it('rejects a URL whose host has no dot', () => {
        const applicationForm = buildApplicationForm({
          ...VALID_DESIGNER,
          portfolio: 'http://test---',
        });

        expect(portfolioOf(applicationForm)().valid()).toBe(false);
        expect(kindsOf(portfolioOf(applicationForm))).toContain('pattern');
      });

      it('accepts designer once the portfolio is a URL', () => {
        const applicationForm = buildApplicationForm(VALID_DESIGNER);

        expect(portfolioOf(applicationForm)().valid()).toBe(true);
      });
    });

    describe('skills (applyEach + pattern)', () => {
      it('rejects a skill that is not letters-only', () => {
        const applicationForm = buildApplicationForm({
          ...INITIAL_APPLICATION,
          skills: ['---'],
        });

        expect(applicationForm.skills[0]().valid()).toBe(false);
        expect(kindsOf(applicationForm.skills[0])).toContain('pattern');
        expect(messagesOf(applicationForm.skills[0])).toContain(
          'Letters only. No numbers or special characters.',
        );
      });

      it('accepts a letters-only skill', () => {
        const applicationForm = buildApplicationForm({
          ...INITIAL_APPLICATION,
          skills: ['Angular'],
        });

        expect(applicationForm.skills[0]().valid()).toBe(true);
      });
    });

    describe('form as a whole', () => {
      it('is invalid while empty', () => {
        const applicationForm = buildApplicationForm();

        expect(applicationForm().valid()).toBe(false);
        expect(applicationForm().invalid()).toBe(true);
      });

      it('is valid once every frontend field is filled', () => {
        const applicationForm = buildApplicationForm(VALID_FRONTEND);

        expect(applicationForm().valid()).toBe(true);
      });

      it('is invalid when a designer field is unmet', () => {
        const applicationForm = buildApplicationForm({
          ...VALID_DESIGNER,
          portfolio: '',
        });

        expect(applicationForm().valid()).toBe(false);
      });
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const appForm = (): FieldTree<Application> =>
      (
        fixture.componentInstance as unknown as {
          applicationForm: FieldTree<Application>;
        }
      ).applicationForm;

    const roleButton = (label: string): HTMLButtonElement =>
      Array.from(
        host
          .querySelector('[aria-label="Choose a role"]')
          ?.querySelectorAll('button') ?? [],
      ).find((button) =>
        button.textContent?.includes(label),
      ) as HTMLButtonElement;

    const engagementButton = (label: string): HTMLButtonElement =>
      Array.from(
        host
          .querySelector('[aria-labelledby="frontend-engagement-label"]')
          ?.querySelectorAll('button') ?? [],
      ).find((button) =>
        button.textContent?.includes(label),
      ) as HTMLButtonElement;

    const submitForm = (): void => {
      const formEl = host.querySelector<HTMLFormElement>('form');

      if (!formEl) throw new Error('no form rendered');
      formEl.requestSubmit();
    };

    const settleSubmit = async (): Promise<void> => {
      await vi.advanceTimersByTimeAsync(SUBMIT_DELAY_MS);

      await fixture.whenStable();
      await Promise.resolve();
      await fixture.whenStable();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => vi.useRealTimers());

    it('renders the frontend card by default', () => {
      expect(host.querySelector('#frontend-name')).toBeTruthy();
      expect(host.querySelector('#designer-portfolio')).toBeNull();
      expect(host.textContent).toContain('Frontend application');
    });

    it('switches to the designer card and shows portfolio', async () => {
      roleButton('Designer').click();
      await fixture.whenStable();

      expect(host.querySelector('#designer-portfolio')).toBeTruthy();
      expect(host.querySelector('#frontend-name')).toBeNull();
      expect(appForm().role().value()).toBe('designer');
    });

    it('resets the form to pristine when the role tab switches', async () => {
      appForm().name().value.set('Kristy Mae Almuete');
      appForm().name().markAsDirty();
      appForm().name().markAsTouched();
      await fixture.whenStable();
      expect(appForm().name().dirty()).toBe(true);

      roleButton('Designer').click();
      await fixture.whenStable();

      expect(appForm().name().value()).toBe('');
      expect(appForm().name().dirty()).toBe(false);
      expect(appForm().name().touched()).toBe(false);
      expect(appForm().role().value()).toBe('designer');
      expect(appForm()().value()).toEqual(createApplication('designer'));
    });

    it('reveals the day rate field when contract is selected', async () => {
      expect(host.querySelector('#frontend-day-rate')).toBeNull();

      engagementButton('Contract').click();
      await fixture.whenStable();

      expect(host.querySelector('#frontend-day-rate')).toBeTruthy();
    });

    it('shows a required message after an empty field is touched', async () => {
      appForm().name().markAsTouched();
      await fixture.whenStable();

      expect(host.textContent).toContain('Name is required.');
    });

    it('blocks submit and reports the required error when empty (onInvalid)', async () => {
      submitForm();
      await fixture.whenStable();

      expect(host.textContent).toContain('Name is required.');
      expect(host.textContent).not.toContain('Skill already exists');
      expect(host.textContent).not.toContain('Application sent');
    });

    it('shows the success banner after a valid submit settles', async () => {
      appForm().name().value.set(VALID_FRONTEND.name);
      appForm().years().value.set(VALID_FRONTEND.years);
      await fixture.whenStable();

      submitForm();
      await settleSubmit();

      expect(host.textContent).toContain(
        "Application sent. We'll be in touch.",
      );
    });

    it('does not flash skill draft errors while debounce is in flight', async () => {
      const input = host.querySelector('#frontend-skill') as HTMLInputElement;

      input.value = 'Signals';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();

      expect(host.textContent).not.toContain('Skill already exists');
      expect(host.textContent).not.toContain(
        'Letters only. No numbers or special characters.',
      );

      await vi.advanceTimersByTimeAsync(300);
      await fixture.whenStable();

      expect(host.textContent).not.toContain('Skill already exists');
    });

    it('clears the success banner when the role tab switches', async () => {
      appForm().name().value.set(VALID_FRONTEND.name);
      appForm().years().value.set(VALID_FRONTEND.years);
      await fixture.whenStable();

      submitForm();
      await settleSubmit();
      expect(host.textContent).toContain('Application sent');

      roleButton('Designer').click();
      await fixture.whenStable();

      expect(host.textContent).not.toContain('Application sent');
    });

    it('resets to a pristine application when Retry is clicked', async () => {
      appForm().name().value.set(VALID_FRONTEND.name);
      appForm().years().value.set(VALID_FRONTEND.years);
      await fixture.whenStable();

      submitForm();
      await settleSubmit();
      expect(host.textContent).toContain('Application sent');

      const retryButton = Array.from(host.querySelectorAll('button')).find(
        (button) => button.textContent?.includes('Retry'),
      ) as HTMLButtonElement;

      retryButton.click();
      await fixture.whenStable();

      expect(host.textContent).not.toContain('Application sent');
      expect(appForm().name().value()).toBe('');
      expect(appForm().name().dirty()).toBe(false);
      expect(appForm().name().touched()).toBe(false);
      expect(appForm()().value()).toEqual(createApplication('frontend'));
    });
  });
});
