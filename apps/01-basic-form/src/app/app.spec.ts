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

    const buildForm = (initial: Partial<RegistrationFormModel> = {}) => {
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
      const f = buildForm();
      expect(f().value()).toEqual(EMPTY_MODEL);
      expect(f().dirty()).toBe(false);
      expect(f().touched()).toBe(false);
    });

    it('is invalid while the required Name is empty', () => {
      const f = buildForm();
      expect(f.name().valid()).toBe(false);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('reports a required error on Name', () => {
      const f = buildForm();
      expect(f.name().errors().length).toBeGreaterThan(0);
    });

    it('becomes valid once Name has a value', () => {
      const f = buildForm();
      f.name().value.set('Ada Lovelace');
      expect(f.name().valid()).toBe(true);
      expect(f().valid()).toBe(true);
    });

    it('returns to invalid when Name is cleared again', () => {
      const f = buildForm({ name: 'Ada' });
      expect(f().valid()).toBe(true);

      f.name().value.set('');
      expect(f().valid()).toBe(false);
    });
  });

  /**
   * Component-bound tests. These exercise what only the rendered component can:
   * DOM binding, the disabled/dirty wiring on the buttons, submit, and reset.
   */
  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const state = (): { value(): RegistrationFormModel; dirty(): boolean } =>
      (
        fixture.componentInstance as unknown as {
          userForm: () => { value(): RegistrationFormModel; dirty(): boolean };
        }
      ).userForm();

    const byId = <T extends HTMLElement>(id: string): T =>
      host.querySelector<T>(`#${id}`) as T;

    const buttonByText = (text: string): HTMLButtonElement =>
      Array.from(host.querySelectorAll('button')).find((b) =>
        b.textContent?.trim().startsWith(text),
      ) as HTMLButtonElement;

    /** Act on a native control, then wait for the zoneless update to settle. */
    const setValue = async (
      el: HTMLInputElement | HTMLTextAreaElement,
      value: string,
    ): Promise<void> => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
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
      expect(byId('name')).toBeTruthy();
      expect(byId('age')).toBeTruthy();
      expect(byId('role')).toBeTruthy();
      expect(byId('bio')).toBeTruthy();
      expect(byId('beginner')).toBeTruthy();
      expect(buttonByText('Save')).toBeTruthy();
      expect(buttonByText('Clear')).toBeTruthy();
    });

    it('disables Save and Clear on a pristine form', () => {
      expect(buttonByText('Save').disabled).toBe(true);
      expect(buttonByText('Clear').disabled).toBe(true);
    });

    it('marks the form dirty and enables Save/Clear after editing', async () => {
      await setValue(byId<HTMLInputElement>('name'), 'Ada');

      expect(state().dirty()).toBe(true);
      expect(buttonByText('Save').disabled).toBe(false);
      expect(buttonByText('Clear').disabled).toBe(false);
    });

    it('flows typed values into the form model', async () => {
      await setValue(byId<HTMLInputElement>('name'), 'Ada');
      await setValue(byId<HTMLInputElement>('age'), '30');
      await setValue(
        byId<HTMLTextAreaElement>('bio'),
        'Enchantress of numbers',
      );

      const value = state().value();
      expect(value.name).toBe('Ada');
      expect(value.age).toBe(30);
      expect(value.bio).toBe('Enchantress of numbers');
    });

    it('toggles the beginner flag from the checkbox', async () => {
      const checkbox = byId<HTMLInputElement>('beginner');
      checkbox.click();
      await fixture.whenStable();

      expect(state().value().beginner).toBe(true);
    });

    it('surfaces the captured values after submitting', async () => {
      await setValue(byId<HTMLInputElement>('name'), 'Ada');

      buttonByText('Save').click();
      await fixture.whenStable();

      const shown = Array.from(document.querySelectorAll('dd')).map((d) =>
        d.textContent?.trim(),
      );
      expect(shown).toContain('Ada');
    });

    it('clears the form back to its initial state', async () => {
      await setValue(byId<HTMLInputElement>('name'), 'Ada');
      expect(state().dirty()).toBe(true);

      buttonByText('Clear').click();
      await fixture.whenStable();

      expect(state().value()).toEqual(EMPTY_MODEL);
      expect(state().dirty()).toBe(false);
      expect(byId<HTMLInputElement>('name').value).toBe('');
    });
  });
});
