import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Injector, signal } from '@angular/core';
import { form, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import { INITIAL_USER, UserFormModel } from './app.model';
import { userSchema } from './app.schema';

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

describe('App (03 · Cross-Field Validation)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    const buildUserForm = (
      initial: Partial<UserFormModel> = {},
    ): FieldTree<UserFormModel> => {
      const model = signal<UserFormModel>({ ...INITIAL_USER, ...initial });

      return form(model, userSchema, { injector: TestBed.inject(Injector) });
    };

    describe('email', () => {
      it('is required', () => {
        const userForm = buildUserForm();

        expect(userForm.email().valid()).toBe(false);
        expect(messagesOf(userForm.email)).toContain(
          'Please enter your email.',
        );
      });

      it('rejects a malformed address', () => {
        const userForm = buildUserForm({ email: 'not-an-email' });

        expect(messagesOf(userForm.email)).toContain(
          'Please enter a valid email address',
        );
      });

      it('accepts a valid address', () => {
        const userForm = buildUserForm({ email: 'ada@dev.io' });

        expect(userForm.email().valid()).toBe(true);
      });
    });

    describe('confirmEmail', () => {
      it('is required', () => {
        const userForm = buildUserForm();

        expect(messagesOf(userForm.confirmEmail)).toContain(
          'Please enter your email.',
        );
      });

      it('rejects a malformed address', () => {
        const userForm = buildUserForm({ confirmEmail: 'not-an-email' });

        expect(messagesOf(userForm.confirmEmail)).toContain(
          'Please enter a valid email address',
        );
      });
    });

    describe('cross-field match (the recipe)', () => {
      it('flags a mismatch on confirmEmail', () => {
        const userForm = buildUserForm({
          email: 'ada@dev.io',
          confirmEmail: 'grace@dev.io',
        });

        expect(kindsOf(userForm.confirmEmail)).toContain('emailMismatch');
        expect(messagesOf(userForm.confirmEmail)).toContain(
          'Email addresses do not match.',
        );
        expect(userForm.confirmEmail().valid()).toBe(false);
      });

      it('passes when the two addresses are identical', () => {
        const userForm = buildUserForm({
          email: 'ada@dev.io',
          confirmEmail: 'ada@dev.io',
        });

        expect(kindsOf(userForm.confirmEmail)).not.toContain('emailMismatch');
        expect(userForm.confirmEmail().valid()).toBe(true);
      });

      it('ignores letter case when comparing', () => {
        const userForm = buildUserForm({
          email: 'Ada@Dev.io',
          confirmEmail: 'ada@dev.io',
        });

        expect(kindsOf(userForm.confirmEmail)).not.toContain('emailMismatch');
        expect(userForm.confirmEmail().valid()).toBe(true);
      });

      it('ignores surrounding whitespace when comparing', () => {
        const userForm = buildUserForm({
          email: 'ada@dev.io',
          confirmEmail: '  ada@dev.io  ',
        });

        expect(kindsOf(userForm.confirmEmail)).not.toContain('emailMismatch');
      });

      it('does not compare until both fields have a value', () => {
        const userForm = buildUserForm({ confirmEmail: 'ada@dev.io' });

        expect(kindsOf(userForm.confirmEmail)).not.toContain('emailMismatch');
      });

      it('reports both the format and mismatch rules at once', () => {
        const userForm = buildUserForm({
          email: 'ada@dev.io',
          confirmEmail: 'nope',
        });

        expect(kindsOf(userForm.confirmEmail)).toEqual(
          expect.arrayContaining(['email', 'emailMismatch']),
        );
      });
    });

    describe('form as a whole', () => {
      it('is invalid while empty', () => {
        const userForm = buildUserForm();

        expect(userForm().valid()).toBe(false);
        expect(userForm().invalid()).toBe(true);
      });

      it('becomes valid once both addresses are filled and match', () => {
        const userForm = buildUserForm({
          email: 'ada@dev.io',
          confirmEmail: 'ada@dev.io',
        });

        expect(userForm().valid()).toBe(true);
      });
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const userForm = (): FieldTree<UserFormModel> =>
      (
        fixture.componentInstance as unknown as {
          userForm: FieldTree<UserFormModel>;
        }
      ).userForm;

    const controlById = <T extends HTMLElement>(id: string): T =>
      host.querySelector<T>(`#${id}`) as T;

    const checkIcons = (): NodeListOf<Element> =>
      host.querySelectorAll('ng-icon[name="tablerCheck"]');

    const settle = async (): Promise<void> => {
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

    it('renders both email controls with their error regions', () => {
      expect(controlById('email')).toBeTruthy();
      expect(controlById('confirm-email')).toBeTruthy();
      expect(host.querySelectorAll('app-validation-errors').length).toBe(2);
    });

    it('shows the required message after an empty email is touched', async () => {
      userForm().email().markAsTouched();
      await settle();

      expect(host.textContent).toContain('Please enter your email.');
    });

    it('shows the mismatch message under confirm email', async () => {
      userForm().email().value.set('ada@dev.io');
      userForm().confirmEmail().value.set('grace@dev.io');
      userForm().confirmEmail().markAsTouched();
      await settle();

      expect(host.textContent).toContain('Email addresses do not match.');
    });

    it('hides the valid check until the form is dirty and valid', () => {
      expect(checkIcons().length).toBe(0);
    });

    it('shows the valid check on both fields once matching emails are entered', async () => {
      userForm().email().value.set('ada@dev.io');
      userForm().confirmEmail().value.set('ada@dev.io');
      userForm().email().markAsDirty();
      await settle();

      expect(checkIcons().length).toBe(2);
    });
  });
});
