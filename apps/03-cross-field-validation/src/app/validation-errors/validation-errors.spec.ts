import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import { INITIAL_USER, UserFormModel } from '../app.model';
import { userSchema } from '../app.schema';
import { ValidationErrors } from './validation-errors';

describe('ValidationErrors', () => {
  let fixture: ComponentFixture<ValidationErrors>;
  let host: HTMLElement;

  const buildUserForm = (
    initial: Partial<UserFormModel> = {},
  ): FieldTree<UserFormModel> => {
    const model = signal<UserFormModel>({ ...INITIAL_USER, ...initial });
    return form(model, userSchema, { injector: TestBed.inject(Injector) });
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
      await showErrorsFor(buildUserForm().email);

      expect(errorList()).toBeNull();
    });

    it('renders nothing for a valid field, even after it is touched', async () => {
      const emailField = buildUserForm({ email: 'ada@dev.io' }).email;
      emailField().markAsTouched();
      await showErrorsFor(emailField);

      expect(errorList()).toBeNull();
    });

    it('shows the errors once an invalid field is touched', async () => {
      const emailField = buildUserForm().email;
      emailField().markAsTouched();
      await showErrorsFor(emailField);

      expect(errorList()).not.toBeNull();
    });

    it('shows the errors once an invalid field is dirty', async () => {
      const emailField = buildUserForm().email;
      emailField().markAsDirty();
      await showErrorsFor(emailField);

      expect(errorList()).not.toBeNull();
    });
  });

  describe('rendering real cross-field errors', () => {
    it("surfaces the email 'required' message", async () => {
      const emailField = buildUserForm().email;
      emailField().markAsTouched();
      await showErrorsFor(emailField);

      expect(host.textContent).toContain('Please enter your email.');
    });

    it('surfaces the email format message', async () => {
      const emailField = buildUserForm({ email: 'nope' }).email;
      emailField().markAsTouched();
      await showErrorsFor(emailField);

      expect(host.textContent).toContain('Please enter a valid email address');
    });

    it('surfaces the cross-field mismatch message on confirmEmail', async () => {
      const confirmField = buildUserForm({
        email: 'ada@dev.io',
        confirmEmail: 'grace@dev.io',
      }).confirmEmail;
      confirmField().markAsTouched();
      await showErrorsFor(confirmField);

      expect(host.textContent).toContain('Email addresses do not match.');
    });

    it('renders a bullet list with every message when confirmEmail has multiple errors', async () => {
      const confirmField = buildUserForm({
        email: 'ada@dev.io',
        confirmEmail: 'nope',
      }).confirmEmail;
      confirmField().markAsTouched();
      await showErrorsFor(confirmField);

      const list = errorList();
      expect(list?.classList.contains('list-disc')).toBe(true);
      expect(list?.classList.contains('pl-5')).toBe(true);
      expect(host.querySelectorAll('li').length).toBe(2);
      expect(host.textContent).toContain('Please enter a valid email address');
      expect(host.textContent).toContain('Email addresses do not match.');
    });

    it('renders a flat list for a single error', async () => {
      const emailField = buildUserForm({ email: 'nope' }).email;
      emailField().markAsTouched();
      await showErrorsFor(emailField);

      const list = errorList();
      expect(list?.classList.contains('list-disc')).toBe(false);
      expect(host.querySelectorAll('li').length).toBe(1);
    });
  });

  describe('accessibility', () => {
    it('exposes the errors to assistive technology', async () => {
      const emailField = buildUserForm().email;
      emailField().markAsTouched();
      await showErrorsFor(emailField);

      const list = errorList();
      expect(list?.getAttribute('role')).toBe('alert');
      expect(list?.getAttribute('aria-live')).toBeNull();
    });
  });
});
