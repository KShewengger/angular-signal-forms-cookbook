import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Injector, signal } from '@angular/core';
import { form, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import { INITIAL_REGISTRATION, RegistrationFormModel } from './app.model';
import { registrationSchema } from './app.schema';

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

describe('App (02 · Built-in Validations)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

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

    describe('username', () => {
      it('is required', () => {
        const registrationForm = buildRegistrationForm();
        expect(registrationForm.username().valid()).toBe(false);
        expect(messagesOf(registrationForm.username)).toContain(
          'Please enter a username.',
        );
      });

      it('enforces a minimum length of 5', () => {
        const registrationForm = buildRegistrationForm({ username: 'ab' });
        expect(messagesOf(registrationForm.username)).toContain(
          'Username must be at least 5 characters long.',
        );
      });

      it('enforces a maximum length of 20', () => {
        const registrationForm = buildRegistrationForm({
          username: 'U'.repeat(21),
        });
        expect(messagesOf(registrationForm.username)).toContain(
          'Username cannot exceed 20 characters.',
        );
      });

      it('enforces the USER-123 pattern', () => {
        const registrationForm = buildRegistrationForm({
          username: 'username-1',
        });
        expect(messagesOf(registrationForm.username)).toContain(
          'Username must follow the format USER-123.',
        );
      });

      it('reports both the length and pattern rules for a short, malformed value', () => {
        const registrationForm = buildRegistrationForm({ username: 'ab' });
        expect(kindsOf(registrationForm.username)).toEqual(
          expect.arrayContaining(['minLength', 'pattern']),
        );
      });

      it('is valid for USER-123', () => {
        const registrationForm = buildRegistrationForm({
          username: 'USER-123',
        });
        expect(registrationForm.username().valid()).toBe(true);
      });
    });

    describe('email', () => {
      it('is required', () => {
        const registrationForm = buildRegistrationForm();
        expect(messagesOf(registrationForm.email)).toContain(
          'Please enter your email address.',
        );
      });

      it('rejects a malformed address', () => {
        const registrationForm = buildRegistrationForm({
          email: 'not-an-email',
        });
        expect(messagesOf(registrationForm.email)).toContain(
          'Please enter a valid email address.',
        );
      });

      it('accepts a valid address', () => {
        const registrationForm = buildRegistrationForm({ email: 'ada@dev.io' });
        expect(registrationForm.email().valid()).toBe(true);
      });
    });

    describe('age', () => {
      it('is required', () => {
        const registrationForm = buildRegistrationForm();
        expect(messagesOf(registrationForm.age)).toContain(
          'Please enter your age.',
        );
      });

      it('enforces a minimum of 10', () => {
        const registrationForm = buildRegistrationForm({ age: 5 });
        expect(messagesOf(registrationForm.age)).toContain(
          'You must be at least 10 years old.',
        );
      });

      it('accepts an age of 10 or more', () => {
        const registrationForm = buildRegistrationForm({ age: 18 });
        expect(registrationForm.age().valid()).toBe(true);
      });
    });

    describe('role', () => {
      it('is required', () => {
        const registrationForm = buildRegistrationForm();
        expect(messagesOf(registrationForm.role)).toContain(
          'Please select a role.',
        );
      });

      it('accepts a selected role', () => {
        const registrationForm = buildRegistrationForm({ role: 'user' });
        expect(registrationForm.role().valid()).toBe(true);
      });
    });

    describe('bio', () => {
      it('is required', () => {
        const registrationForm = buildRegistrationForm();
        expect(messagesOf(registrationForm.bio)).toContain(
          'Please enter a short bio.',
        );
      });

      it('enforces a minimum length of 5', () => {
        const registrationForm = buildRegistrationForm({ bio: 'hi' });
        expect(messagesOf(registrationForm.bio)).toContain(
          'Bio must be at least 5 characters long.',
        );
      });

      it('accepts a bio of 5 characters or more', () => {
        const registrationForm = buildRegistrationForm({ bio: 'Hello world' });
        expect(registrationForm.bio().valid()).toBe(true);
      });
    });

    describe('form as a whole', () => {
      it('is invalid while empty', () => {
        const registrationForm = buildRegistrationForm();
        expect(registrationForm().valid()).toBe(false);
        expect(registrationForm().invalid()).toBe(true);
      });

      it('becomes valid once every field is filled correctly', () => {
        const registrationForm = buildRegistrationForm({
          username: 'USER-123',
          email: 'ada@dev.io',
          age: 18,
          role: 'user',
          bio: 'Enchantress of numbers',
        });
        expect(registrationForm().valid()).toBe(true);
      });
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const registrationForm = (): FieldTree<RegistrationFormModel> =>
      (
        fixture.componentInstance as unknown as {
          userForm: FieldTree<RegistrationFormModel>;
        }
      ).userForm;

    const controlById = <T extends HTMLElement>(id: string): T =>
      host.querySelector<T>(`#${id}`) as T;

    const buttonByText = (text: string): HTMLButtonElement =>
      Array.from(host.querySelectorAll('button')).find((button) =>
        button.textContent?.trim().startsWith(text),
      ) as HTMLButtonElement;

    const typeInto = async (
      control: HTMLInputElement | HTMLTextAreaElement,
      value: string,
    ): Promise<void> => {
      control.value = value;
      control.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    };

    const blur = async (control: HTMLElement): Promise<void> => {
      control.dispatchEvent(new Event('blur', { bubbles: true }));
      await fixture.whenStable();
    };

    const fillValidForm = async (): Promise<void> => {
      await typeInto(controlById<HTMLInputElement>('username'), 'USER-123');
      await typeInto(controlById<HTMLInputElement>('email'), 'ada@dev.io');
      await typeInto(controlById<HTMLInputElement>('age'), '18');
      await typeInto(controlById<HTMLTextAreaElement>('bio'), 'Enchantress');
      registrationForm().role().value.set('user');
      await fixture.whenStable();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('renders the registration form with all six controls', () => {
      expect(host.querySelector('#registration-title')?.textContent).toContain(
        'Registration',
      );
      expect(controlById('username')).toBeTruthy();
      expect(controlById('email')).toBeTruthy();
      expect(controlById('age')).toBeTruthy();
      expect(controlById('role')).toBeTruthy();
      expect(controlById('bio')).toBeTruthy();
      expect(controlById('beginner')).toBeTruthy();
      expect(buttonByText('Save')).toBeTruthy();
      expect(buttonByText('Clear')).toBeTruthy();
    });

    it('disables Save and Clear on a pristine form', () => {
      expect(buttonByText('Save').disabled).toBe(true);
      expect(buttonByText('Clear').disabled).toBe(true);
    });

    it('enables Clear but keeps Save disabled while the form is invalid', async () => {
      await typeInto(controlById<HTMLInputElement>('username'), 'ab');

      expect(buttonByText('Clear').disabled).toBe(false);
      expect(buttonByText('Save').disabled).toBe(true);
    });

    it('enables Save only once the form is dirty and fully valid', async () => {
      await fillValidForm();

      expect(buttonByText('Save').disabled).toBe(false);
    });

    it('shows a required message after an empty field is touched', async () => {
      await blur(controlById<HTMLInputElement>('username'));

      expect(host.textContent).toContain('Please enter a username.');
    });

    it('flows typed values into the form model', async () => {
      await typeInto(controlById<HTMLInputElement>('username'), 'USER-123');
      await typeInto(controlById<HTMLInputElement>('age'), '30');
      await typeInto(controlById<HTMLTextAreaElement>('bio'), 'Enchantress');

      const value = registrationForm()().value();
      expect(value.username).toBe('USER-123');
      expect(value.age).toBe(30);
      expect(value.bio).toBe('Enchantress');
    });

    it('toggles the beginner flag from the checkbox', async () => {
      controlById<HTMLInputElement>('beginner').click();
      await fixture.whenStable();

      expect(registrationForm()().value().beginner).toBe(true);
    });

    it('opens the summary dialog with the captured values on submit', async () => {
      await fillValidForm();

      buttonByText('Save').click();
      await fixture.whenStable();

      const dialog = host.querySelector('dialog');
      expect(dialog?.open).toBe(true);
      expect(dialog?.textContent).toContain('USER-123');
    });

    it('clears the form back to its initial state', async () => {
      await typeInto(controlById<HTMLInputElement>('username'), 'USER-123');
      expect(registrationForm()().dirty()).toBe(true);

      buttonByText('Clear').click();
      await fixture.whenStable();

      expect(registrationForm()().dirty()).toBe(false);
      expect(controlById<HTMLInputElement>('username').value).toBe('');
    });
  });
});
