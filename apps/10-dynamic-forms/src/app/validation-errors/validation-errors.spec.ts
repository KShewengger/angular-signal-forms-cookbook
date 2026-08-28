import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  apply,
  debounce,
  form,
  required,
  type FieldTree,
} from '@angular/forms/signals';
import {
  Application,
  ContractEngagement,
  DesignerApplication,
} from '../app.model';
import { INITIAL_APPLICATION } from '../app.data';
import { applicationSchema, skillItemSchema } from '../app.schema';
import { ValidationErrors } from './validation-errors';

const EMPTY_DESIGNER: DesignerApplication = {
  role: 'designer',
  name: '',
  years: null,
  engagement: { kind: 'fulltime' },
  skills: [],
  portfolio: '',
};

describe('ValidationErrors (10 · Dynamic Forms)', () => {
  let fixture: ComponentFixture<ValidationErrors>;
  let host: HTMLElement;

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
    (applicationForm as unknown as FieldTree<DesignerApplication>).portfolio;

  const dayRateOf = (
    applicationForm: FieldTree<Application>,
  ): FieldTree<number | null> =>
    (applicationForm.engagement as unknown as FieldTree<ContractEngagement>)
      .dayRate;

  const showErrorsFor = async (field: FieldTree<unknown>): Promise<void> => {
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  };

  const errorList = (): HTMLUListElement | null => host.querySelector('ul');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ValidationErrors] });
    fixture = TestBed.createComponent(ValidationErrors);
    host = fixture.nativeElement as HTMLElement;
  });

  describe('visibility', () => {
    it('renders nothing while the field is pristine and untouched', async () => {
      await showErrorsFor(buildApplicationForm().name);

      expect(errorList()).toBeNull();
    });

    it('renders nothing for a valid field, even after it is touched', async () => {
      const nameField = buildApplicationForm({
        ...INITIAL_APPLICATION,
        name: 'Kristy Mae Almuete',
      }).name;

      nameField().markAsTouched();
      await showErrorsFor(nameField);

      expect(errorList()).toBeNull();
    });

    it('shows the errors once an invalid field is touched', async () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsTouched();
      await showErrorsFor(nameField);

      expect(errorList()).not.toBeNull();
    });

    it('shows the errors once an invalid field is dirty', async () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsDirty();
      await showErrorsFor(nameField);

      expect(errorList()).not.toBeNull();
    });

    it('hides the errors once the field becomes valid', async () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsTouched();
      await showErrorsFor(nameField);

      expect(errorList()).not.toBeNull();

      nameField().value.set('Kristy Mae Almuete');
      await fixture.whenStable();

      expect(errorList()).toBeNull();
    });
  });

  describe('rendering the real recipe errors', () => {
    it("surfaces the name 'required' message", async () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsTouched();
      await showErrorsFor(nameField);

      expect(host.textContent).toContain('Name is required.');
    });

    it("surfaces the years 'required' message", async () => {
      const yearsField = buildApplicationForm().years;

      yearsField().markAsTouched();
      await showErrorsFor(yearsField);

      expect(host.textContent).toContain('Years of experience is required.');
    });

    it('surfaces the years range message', async () => {
      const yearsField = buildApplicationForm({
        ...INITIAL_APPLICATION,
        years: 11,
      }).years;

      yearsField().markAsTouched();
      await showErrorsFor(yearsField);

      expect(host.textContent).toContain('Keep years between 0 and 10.');
    });

    it("surfaces the contract day rate 'required' message", async () => {
      const dayRateField = dayRateOf(
        buildApplicationForm({
          ...INITIAL_APPLICATION,
          engagement: { kind: 'contract', dayRate: null },
        }),
      );

      dayRateField().markAsTouched();
      await showErrorsFor(dayRateField);

      expect(host.textContent).toContain('Enter a day rate.');
    });

    it("surfaces the designer portfolio 'required' message", async () => {
      const portfolioField = portfolioOf(
        buildApplicationForm({ ...EMPTY_DESIGNER }),
      );

      portfolioField().markAsTouched();
      await showErrorsFor(portfolioField);

      expect(host.textContent).toContain('Portfolio URL is required.');
    });

    it('surfaces the designer portfolio URL message', async () => {
      const portfolioField = portfolioOf(
        buildApplicationForm({
          ...EMPTY_DESIGNER,
          portfolio: 'https://ada.dev',
        }),
      );

      portfolioField().markAsTouched();
      await showErrorsFor(portfolioField);

      expect(errorList()).toBeNull();

      portfolioField().value.set('not-a-url');
      await fixture.whenStable();

      expect(host.textContent).toContain('Enter a valid URL.');
    });

    it("surfaces the skill draft 'required' message", async () => {
      const skillField = form(
        signal(''),
        (path) => {
          required(path, { message: 'A skill is required.' });
          apply(path, skillItemSchema);
          debounce(path, 500);
        },
        {
          injector: TestBed.inject(Injector),
        },
      );

      skillField().markAsTouched();
      await showErrorsFor(skillField);

      expect(host.textContent).toContain('A skill is required.');
    });

    it('surfaces the skill letters-only message', async () => {
      const skillField = buildApplicationForm({
        ...INITIAL_APPLICATION,
        skills: ['---'],
      }).skills[0];

      skillField().markAsTouched();
      await showErrorsFor(skillField);

      expect(host.textContent).toContain(
        'Letters only. No numbers or special characters.',
      );
    });

    it('renders a flat list for a single error', async () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsTouched();
      await showErrorsFor(nameField);

      const list = errorList();
      expect(list?.classList.contains('list-disc')).toBe(false);
      expect(host.querySelectorAll('li').length).toBe(1);
    });
  });

  describe('accessibility', () => {
    it('exposes the errors to assistive technology', async () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsTouched();
      await showErrorsFor(nameField);

      const list = errorList();
      expect(list?.getAttribute('role')).toBe('alert');
      expect(list?.getAttribute('aria-live')).toBe('polite');
    });

    it('puts messageId on the alert list for aria-describedby', async () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsTouched();
      fixture.componentRef.setInput('messageId', 'frontend-name-errors');
      await showErrorsFor(nameField);

      expect(errorList()?.getAttribute('id')).toBe('frontend-name-errors');
    });
  });
});
