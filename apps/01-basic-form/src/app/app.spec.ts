import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { RegistrationFormModel } from './app.model';

interface FieldState {
  value(): RegistrationFormModel;
  valid(): boolean;
  invalid(): boolean;
  dirty(): boolean;
  touched(): boolean;
}
type FormRoot = () => FieldState;

const EMPTY_MODEL: RegistrationFormModel = {
  name: '',
  age: null,
  role: null,
  bio: '',
  beginner: false,
};

describe('App (01 · Basic Form)', () => {
  let fixture: ComponentFixture<App>;
  let host: HTMLElement;

  const form = (): FormRoot =>
    (fixture.componentInstance as unknown as { userForm: FormRoot }).userForm;
  const state = (): FieldState => form()();

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

  describe('initial state', () => {
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

    it('starts empty, pristine, and untouched', () => {
      expect(state().value()).toEqual(EMPTY_MODEL);
      expect(state().dirty()).toBe(false);
      expect(state().touched()).toBe(false);
    });

    it('is invalid while the required Name is empty', () => {
      expect(state().valid()).toBe(false);
      expect(state().invalid()).toBe(true);
    });

    it('disables Save and Clear on a pristine form', () => {
      expect(buttonByText('Save').disabled).toBe(true);
      expect(buttonByText('Clear').disabled).toBe(true);
    });
  });

  describe('required validation on Name', () => {
    it('becomes valid once Name has a value', async () => {
      await setValue(byId<HTMLInputElement>('name'), 'Ada Lovelace');
      expect(state().valid()).toBe(true);
      expect(state().invalid()).toBe(false);
    });

    it('returns to invalid when Name is cleared again', async () => {
      const name = byId<HTMLInputElement>('name');
      await setValue(name, 'Ada');
      expect(state().valid()).toBe(true);

      await setValue(name, '');
      expect(state().valid()).toBe(false);
    });
  });

  describe('interaction state', () => {
    it('marks the form dirty and enables Save/Clear after editing', async () => {
      await setValue(byId<HTMLInputElement>('name'), 'Ada');

      expect(state().dirty()).toBe(true);
      expect(buttonByText('Save').disabled).toBe(false);
      expect(buttonByText('Clear').disabled).toBe(false);
    });
  });

  describe('two-way binding', () => {
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
  });

  describe('submit', () => {
    it('surfaces the captured values after submitting', async () => {
      await setValue(byId<HTMLInputElement>('name'), 'Ada');

      buttonByText('Save').click();
      await fixture.whenStable();

      const shown = Array.from(document.querySelectorAll('dd')).map((d) =>
        d.textContent?.trim(),
      );
      expect(shown).toContain('Ada');
    });
  });

  describe('reset', () => {
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
