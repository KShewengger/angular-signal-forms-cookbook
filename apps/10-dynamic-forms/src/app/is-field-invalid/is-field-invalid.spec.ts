import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  apply,
  debounce,
  form,
  required,
  type FieldTree,
} from '@angular/forms/signals';
import { INITIAL_APPLICATION } from '../app.data';
import {
  Application,
  ContractEngagement,
  DesignerApplication,
} from '../app.model';
import { applicationSchema, skillItemSchema } from '../app.schema';
import { IsFieldInvalidPipe } from './is-field-invalid';

const EMPTY_DESIGNER: DesignerApplication = {
  role: 'designer',
  name: '',
  years: null,
  engagement: { kind: 'fulltime' },
  skills: [],
  portfolio: '',
};

describe('IsFieldInvalidPipe (10 · Dynamic Forms)', () => {
  const pipe = new IsFieldInvalidPipe();

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

  const buildSkillDraft = (initial = ''): FieldTree<string> =>
    form(
      signal(initial),
      (path) => {
        required(path, { message: 'A skill is required.' });
        apply(path, skillItemSchema);
        debounce(path, 500);
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

  beforeEach(() => TestBed.configureTestingModule({}));

  describe('visibility', () => {
    it('is false while the field is pristine and untouched', () => {
      expect(pipe.transform(buildApplicationForm().name)).toBe(false);
    });

    it('is false for a valid field, even after it is touched', () => {
      const nameField = buildApplicationForm({
        ...INITIAL_APPLICATION,
        name: 'Kristy Mae Almuete',
      }).name;

      nameField().markAsTouched();

      expect(pipe.transform(nameField)).toBe(false);
    });

    it('is true once an invalid field is touched', () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsTouched();

      expect(pipe.transform(nameField)).toBe(true);
    });

    it('is true once an invalid field is dirty', () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsDirty();

      expect(pipe.transform(nameField)).toBe(true);
    });

    it('becomes false once the field becomes valid', () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsTouched();

      expect(pipe.transform(nameField)).toBe(true);

      nameField().value.set('Kristy Mae Almuete');

      expect(pipe.transform(nameField)).toBe(false);
    });
  });

  describe('frontend form fields', () => {
    it('flags an empty name after it is touched', () => {
      const nameField = buildApplicationForm().name;

      nameField().markAsTouched();

      expect(pipe.transform(nameField)).toBe(true);
    });

    it('does not flag a filled name after it is touched', () => {
      const nameField = buildApplicationForm({
        ...INITIAL_APPLICATION,
        name: 'Kristy Mae Almuete',
      }).name;

      nameField().markAsTouched();

      expect(pipe.transform(nameField)).toBe(false);
    });

    it('flags empty years after they are touched', () => {
      const yearsField = buildApplicationForm().years;

      yearsField().markAsTouched();

      expect(pipe.transform(yearsField)).toBe(true);
    });

    it('flags years outside 0-10 after they are touched', () => {
      const yearsField = buildApplicationForm({
        ...INITIAL_APPLICATION,
        years: 11,
      }).years;

      yearsField().markAsTouched();

      expect(pipe.transform(yearsField)).toBe(true);
    });

    it('does not flag years in range after they are touched', () => {
      const yearsField = buildApplicationForm({
        ...INITIAL_APPLICATION,
        years: 5,
      }).years;

      yearsField().markAsTouched();

      expect(pipe.transform(yearsField)).toBe(false);
    });

    it('flags a missing contract day rate after it is touched', () => {
      const dayRateField = dayRateOf(
        buildApplicationForm({
          ...INITIAL_APPLICATION,
          engagement: { kind: 'contract', dayRate: null },
        }),
      );

      dayRateField().markAsTouched();

      expect(pipe.transform(dayRateField)).toBe(true);
    });

    it('does not flag a contract day rate of 1 or more after it is touched', () => {
      const dayRateField = dayRateOf(
        buildApplicationForm({
          ...INITIAL_APPLICATION,
          engagement: { kind: 'contract', dayRate: 150 },
        }),
      );

      dayRateField().markAsTouched();

      expect(pipe.transform(dayRateField)).toBe(false);
    });
  });

  describe('designer form fields', () => {
    it('flags an empty portfolio after it is touched', () => {
      const portfolioField = portfolioOf(
        buildApplicationForm({ ...EMPTY_DESIGNER }),
      );

      portfolioField().markAsTouched();

      expect(pipe.transform(portfolioField)).toBe(true);
    });

    it('does not flag a valid portfolio URL after it is touched', () => {
      const portfolioField = portfolioOf(
        buildApplicationForm({
          ...EMPTY_DESIGNER,
          portfolio: 'https://ada.dev',
        }),
      );

      portfolioField().markAsTouched();

      expect(pipe.transform(portfolioField)).toBe(false);
    });

    it('flags a portfolio that is not a URL after it is touched', () => {
      const portfolioField = portfolioOf(
        buildApplicationForm({
          ...EMPTY_DESIGNER,
          portfolio: 'https://ada.dev',
        }),
      );

      portfolioField().markAsTouched();

      expect(pipe.transform(portfolioField)).toBe(false);

      portfolioField().value.set('not-a-url');

      expect(pipe.transform(portfolioField)).toBe(true);
    });

    it('flags a missing contract day rate after it is touched', () => {
      const dayRateField = dayRateOf(
        buildApplicationForm({
          ...EMPTY_DESIGNER,
          engagement: { kind: 'contract', dayRate: null },
        }),
      );

      dayRateField().markAsTouched();

      expect(pipe.transform(dayRateField)).toBe(true);
    });
  });

  describe('skill composer fields', () => {
    it('flags an empty skill draft after it is touched', () => {
      const skillField = buildSkillDraft();

      skillField().markAsTouched();

      expect(pipe.transform(skillField)).toBe(true);
    });

    it('does not flag a letters-only skill draft after it is touched', () => {
      const skillField = buildSkillDraft('Signals');

      skillField().markAsTouched();

      expect(pipe.transform(skillField)).toBe(false);
    });

    it('flags a skill chip that is not letters-only after it is touched', () => {
      const skillField = buildApplicationForm({
        ...INITIAL_APPLICATION,
        skills: ['---'],
      }).skills[0];

      skillField().markAsTouched();

      expect(pipe.transform(skillField)).toBe(true);
    });

    it('does not flag a letters-only skill chip after it is touched', () => {
      const skillField = buildApplicationForm().skills[0];

      skillField().markAsTouched();

      expect(pipe.transform(skillField)).toBe(false);
    });
  });
});
