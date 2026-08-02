import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import {
  INITIAL_REGISTRATION,
  RegistrationFormModel,
  registrationSchema,
} from '../app.model';
import { ValidationErrors } from './validation-errors';

describe('ValidationErrors', () => {
  let fixture: ComponentFixture<ValidationErrors>;
  let host: HTMLElement;

  const buildRegistrationForm = (
    initial: Partial<RegistrationFormModel> = {},
  ): FieldTree<RegistrationFormModel> => {
    const model = signal<RegistrationFormModel>({
      ...INITIAL_REGISTRATION,
      ...initial,
    });
    return form(model, registrationSchema, {
      injector: TestBed.inject(Injector),
    });
  };

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
      await showErrorsFor(buildRegistrationForm().username);

      expect(errorList()).toBeNull();
    });

    it('renders nothing for a valid field, even after it is touched', async () => {
      const usernameField = buildRegistrationForm({
        username: 'USER-123',
      }).username;
      usernameField().markAsTouched();
      await showErrorsFor(usernameField);

      expect(errorList()).toBeNull();
    });

    it('shows the errors once an invalid field is touched', async () => {
      const usernameField = buildRegistrationForm().username;
      usernameField().markAsTouched();
      await showErrorsFor(usernameField);

      expect(errorList()).not.toBeNull();
    });

    it('shows the errors once an invalid field is dirty', async () => {
      const usernameField = buildRegistrationForm().username;
      usernameField().markAsDirty();
      await showErrorsFor(usernameField);

      expect(errorList()).not.toBeNull();
    });
  });

  describe('rendering real registration errors', () => {
    it("surfaces the username 'required' message", async () => {
      const usernameField = buildRegistrationForm().username;
      usernameField().markAsTouched();
      await showErrorsFor(usernameField);

      expect(host.textContent).toContain('Please enter a username.');
    });

    it('renders a bullet list with every message when a username has multiple errors', async () => {
      // 'ab' is too short AND breaks the pattern.
      const usernameField = buildRegistrationForm({ username: 'ab' }).username;
      usernameField().markAsTouched();
      await showErrorsFor(usernameField);

      const list = errorList();
      expect(list?.classList.contains('list-disc')).toBe(true);
      expect(list?.classList.contains('pl-5')).toBe(true);
      expect(host.querySelectorAll('li').length).toBe(2);
      expect(host.textContent).toContain(
        'Username must be at least 5 characters long.',
      );
      expect(host.textContent).toContain(
        'Username must follow the format USER-123.',
      );
    });

    it('renders a flat list for a single username error', async () => {
      // 'abcde' is long enough; only the pattern fails.
      const usernameField = buildRegistrationForm({
        username: 'abcde',
      }).username;
      usernameField().markAsTouched();
      await showErrorsFor(usernameField);

      const list = errorList();
      expect(list?.classList.contains('list-disc')).toBe(false);
      expect(host.querySelectorAll('li').length).toBe(1);
      expect(host.textContent).toContain(
        'Username must follow the format USER-123.',
      );
    });

    it('surfaces the email format message', async () => {
      const emailField = buildRegistrationForm({
        email: 'not-an-email',
      }).email;
      emailField().markAsTouched();
      await showErrorsFor(emailField);

      expect(host.textContent).toContain('Please enter a valid email address.');
    });

    it('surfaces the age minimum message', async () => {
      const ageField = buildRegistrationForm({ age: 5 }).age;
      ageField().markAsTouched();
      await showErrorsFor(ageField);

      expect(host.textContent).toContain('You must be at least 10 years old.');
    });
  });

  describe('accessibility', () => {
    it('exposes the errors to assistive technology', async () => {
      const usernameField = buildRegistrationForm().username;
      usernameField().markAsTouched();
      await showErrorsFor(usernameField);

      const list = errorList();
      expect(list?.getAttribute('role')).toBe('alert');
      expect(list?.getAttribute('aria-live')).toBe('polite');
    });
  });
});
