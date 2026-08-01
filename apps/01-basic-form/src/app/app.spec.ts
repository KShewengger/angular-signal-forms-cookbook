import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Injector, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { App } from './app';
import { RegistrationFormModel } from './app.model';

const EMPTY_MODEL: RegistrationFormModel = {
  name: '',
  age: null,
  role: null,
  bio: '',
  beginner: false,
};

describe('App (01 · Basic Form)', () => {
  describe('form schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    const buildRegistrationForm = (
      initial: Partial<RegistrationFormModel> = {},
    ) => {
      const model = signal<RegistrationFormModel>({
        ...EMPTY_MODEL,
        ...initial,
      });
      return form(
        model,
        (path) => {
          required(path.name);
        },
        { injector: TestBed.inject(Injector) },
      );
    };

    it('starts pristine, untouched, and empty', () => {
      const registrationForm = buildRegistrationForm();
      expect(registrationForm().value()).toEqual(EMPTY_MODEL);
      expect(registrationForm().dirty()).toBe(false);
      expect(registrationForm().touched()).toBe(false);
    });

    it('is invalid while the required Name is empty', () => {
      const registrationForm = buildRegistrationForm();
      expect(registrationForm.name().valid()).toBe(false);
      expect(registrationForm().valid()).toBe(false);
      expect(registrationForm().invalid()).toBe(true);
    });

    it('reports a required error on Name', () => {
      const registrationForm = buildRegistrationForm();
      expect(registrationForm.name().errors().length).toBeGreaterThan(0);
    });

    it('becomes valid once Name has a value', () => {
      const registrationForm = buildRegistrationForm();
      registrationForm.name().value.set('Ada Lovelace');
      expect(registrationForm.name().valid()).toBe(true);
      expect(registrationForm().valid()).toBe(true);
    });

    it('returns to invalid when Name is cleared again', () => {
      const registrationForm = buildRegistrationForm({ name: 'Ada' });
      expect(registrationForm().valid()).toBe(true);

      registrationForm.name().value.set('');
      expect(registrationForm().valid()).toBe(false);
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const formState = (): {
      value(): RegistrationFormModel;
      dirty(): boolean;
    } =>
      (
        fixture.componentInstance as unknown as {
          userForm: () => { value(): RegistrationFormModel; dirty(): boolean };
        }
      ).userForm();

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

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('creates the component', () => {
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('renders the registration form and all five controls', () => {
      expect(host.querySelector('#registration-title')?.textContent).toContain(
        'Registration',
      );
      expect(controlById('name')).toBeTruthy();
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

    it('marks the form dirty and enables Save/Clear after editing', async () => {
      await typeInto(controlById<HTMLInputElement>('name'), 'Ada');

      expect(formState().dirty()).toBe(true);
      expect(buttonByText('Save').disabled).toBe(false);
      expect(buttonByText('Clear').disabled).toBe(false);
    });

    it('flows typed values into the form model', async () => {
      await typeInto(controlById<HTMLInputElement>('name'), 'Ada');
      await typeInto(controlById<HTMLInputElement>('age'), '30');
      await typeInto(
        controlById<HTMLTextAreaElement>('bio'),
        'Enchantress of numbers',
      );

      const value = formState().value();
      expect(value.name).toBe('Ada');
      expect(value.age).toBe(30);
      expect(value.bio).toBe('Enchantress of numbers');
    });

    it('toggles the beginner flag from the checkbox', async () => {
      const beginnerCheckbox = controlById<HTMLInputElement>('beginner');
      beginnerCheckbox.click();
      await fixture.whenStable();

      expect(formState().value().beginner).toBe(true);
    });

    it('surfaces the captured values after submitting', async () => {
      await typeInto(controlById<HTMLInputElement>('name'), 'Ada');

      buttonByText('Save').click();
      await fixture.whenStable();

      const shownValues = Array.from(document.querySelectorAll('dd')).map(
        (valueCell) => valueCell.textContent?.trim(),
      );
      expect(shownValues).toContain('Ada');
    });

    it('clears the form back to its initial state', async () => {
      await typeInto(controlById<HTMLInputElement>('name'), 'Ada');
      expect(formState().dirty()).toBe(true);

      buttonByText('Clear').click();
      await fixture.whenStable();

      expect(formState().value()).toEqual(EMPTY_MODEL);
      expect(formState().dirty()).toBe(false);
      expect(controlById<HTMLInputElement>('name').value).toBe('');
    });
  });
});
