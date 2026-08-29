import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import {
  Booking,
  INITIAL_BOOKING,
  isImaxExperience,
  isVipExperience,
} from './app.model';
import { bookingSchema } from './app.schema';
import { PROMO_CODE } from './app.data';
import { variantOf } from './app.utils';

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

const buildBookingForm = (
  initial: Partial<Booking> = {},
): FieldTree<Booking> => {
  const model = signal<Booking>({ ...INITIAL_BOOKING, ...initial });

  return form(model, bookingSchema, { injector: TestBed.inject(Injector) });
};

// `experience` is a discriminated union, so its FieldTree only exposes the
// shared `format` key. `variantOf` owns the one narrowing cast and checks the
// guard first, so reading an inactive variant fails loudly instead of silently.
const glassesOf = (bookingForm: FieldTree<Booking>): FieldTree<number | null> =>
  variantOf(bookingForm.experience, isImaxExperience, 'imax').glasses;

const mealOf = (bookingForm: FieldTree<Booking>): FieldTree<string> =>
  variantOf(bookingForm.experience, isVipExperience, 'vip').mealChoice;

const FOUR_SEATS = [
  { seat: 'R1' },
  { seat: 'R2' },
  { seat: 'R4' },
  { seat: 'R5' },
];

describe('App (08 · Conditional Validation)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    describe('experience (applyWhenValue)', () => {
      it('adds no extra rule for the standard variant', () => {
        const bookingForm = buildBookingForm();

        expect(bookingForm.experience().valid()).toBe(true);
      });

      it('requires glasses for imax', () => {
        const bookingForm = buildBookingForm({
          experience: { format: 'imax', glasses: null },
        });

        expect(glassesOf(bookingForm)().valid()).toBe(false);
        expect(kindsOf(glassesOf(bookingForm))).toContain('required');
      });

      it('enforces a minimum of one pair of glasses', () => {
        const bookingForm = buildBookingForm({
          experience: { format: 'imax', glasses: 0 },
        });

        expect(kindsOf(glassesOf(bookingForm))).toContain('min');
        expect(glassesOf(bookingForm)().valid()).toBe(false);
      });

      it('accepts imax once glasses is at least one', () => {
        const bookingForm = buildBookingForm({
          experience: { format: 'imax', glasses: 2 },
        });

        expect(glassesOf(bookingForm)().valid()).toBe(true);
      });

      it('requires a meal for vip', () => {
        const bookingForm = buildBookingForm({
          experience: { format: 'vip', mealChoice: '' },
        });

        expect(mealOf(bookingForm)().valid()).toBe(false);
        expect(kindsOf(mealOf(bookingForm))).toContain('required');
      });

      it('accepts vip once a meal is chosen', () => {
        const bookingForm = buildBookingForm({
          experience: { format: 'vip', mealChoice: 'Wagyu slider trio' },
        });

        expect(mealOf(bookingForm)().valid()).toBe(true);
      });
    });

    describe('snacks combo (applyWhen)', () => {
      it('does not require a combo size while snacks are off', () => {
        const bookingForm = buildBookingForm({
          addSnacks: false,
          comboSize: '',
        });

        expect(bookingForm.comboSize().valid()).toBe(true);
      });

      it('requires a combo size once snacks are on', () => {
        const bookingForm = buildBookingForm({
          addSnacks: true,
          comboSize: '',
        });

        expect(bookingForm.comboSize().valid()).toBe(false);
        expect(kindsOf(bookingForm.comboSize)).toContain('required');
      });

      it('accepts a chosen combo size', () => {
        const bookingForm = buildBookingForm({
          addSnacks: true,
          comboSize: 'Medium',
        });

        expect(bookingForm.comboSize().valid()).toBe(true);
      });
    });

    describe('seats (applyEach)', () => {
      it('requires a seat on every ticket', () => {
        const bookingForm = buildBookingForm({ tickets: [{ seat: '' }] });

        expect(bookingForm.tickets[0].seat().valid()).toBe(false);
        expect(kindsOf(bookingForm.tickets[0].seat)).toContain('required');
      });

      it('accepts a ticket that has a seat', () => {
        const bookingForm = buildBookingForm({ tickets: [{ seat: 'R1' }] });

        expect(bookingForm.tickets[0].seat().valid()).toBe(true);
      });
    });

    describe('promo code (disabled + when + validate)', () => {
      it('is disabled until four seats are chosen', () => {
        const bookingForm = buildBookingForm({ tickets: [{ seat: 'R1' }] });

        expect(bookingForm.promoCode().disabled()).toBe(true);
      });

      it('ignores a wrong code while disabled', () => {
        const bookingForm = buildBookingForm({
          tickets: [{ seat: 'R1' }],
          promoCode: 'WRONG',
        });

        expect(bookingForm.promoCode().valid()).toBe(true);
      });

      it('unlocks once four seats are chosen', () => {
        const bookingForm = buildBookingForm({ tickets: FOUR_SEATS });

        expect(bookingForm.promoCode().disabled()).toBe(false);
      });

      it('rejects an unknown code with invalidCoupon', () => {
        const bookingForm = buildBookingForm({
          tickets: FOUR_SEATS,
          promoCode: 'FREESTUFF',
        });

        expect(bookingForm.promoCode().valid()).toBe(false);
        expect(kindsOf(bookingForm.promoCode)).toContain('invalidCoupon');
        expect(messagesOf(bookingForm.promoCode)).toContain('Invalid coupon.');
      });

      it('accepts the real code, case-insensitively', () => {
        const bookingForm = buildBookingForm({
          tickets: FOUR_SEATS,
          promoCode: PROMO_CODE.toLowerCase(),
        });

        expect(bookingForm.promoCode().valid()).toBe(true);
      });

      it('accepts an empty code', () => {
        const bookingForm = buildBookingForm({
          tickets: FOUR_SEATS,
          promoCode: '',
        });

        expect(bookingForm.promoCode().valid()).toBe(true);
      });
    });

    describe('form as a whole', () => {
      it('is valid when empty (standard, no seats)', () => {
        const bookingForm = buildBookingForm();

        expect(bookingForm().valid()).toBe(true);
      });

      it('is invalid when a conditional field is unmet', () => {
        const bookingForm = buildBookingForm({
          experience: { format: 'imax', glasses: null },
        });

        expect(bookingForm().valid()).toBe(false);
        expect(bookingForm().invalid()).toBe(true);
      });
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    // Fields are protected; read them through a narrow cast.
    const appForm = (): FieldTree<Booking> =>
      (
        fixture.componentInstance as unknown as {
          bookingForm: FieldTree<Booking>;
        }
      ).bookingForm;

    const bookButton = (): HTMLButtonElement =>
      Array.from(host.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('Book'),
      ) as HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('renders the experience, seat and snacks controls', () => {
      expect(
        host.querySelectorAll('button[aria-pressed]').length,
      ).toBeGreaterThan(0);
      expect(host.querySelector('input[type="checkbox"]')).toBeTruthy();
    });

    it('reveals the glasses field and its error for imax', async () => {
      appForm().experience().value.set({ format: 'imax', glasses: null });
      glassesOf(appForm())().markAsTouched();
      await fixture.whenStable();

      expect(host.querySelector('#glasses')).toBeTruthy();
      expect(host.textContent).toContain('Enter at least 1 pair of glasses.');
    });

    it('reveals the meal select and its error for vip', async () => {
      appForm().experience().value.set({ format: 'vip', mealChoice: '' });
      mealOf(appForm())().markAsTouched();
      await fixture.whenStable();

      expect(host.querySelector('#meal')).toBeTruthy();
      expect(host.textContent).toContain('Pick a dish to continue.');
    });

    it('reveals the combo size and its error when snacks are on', async () => {
      appForm().addSnacks().value.set(true);
      appForm().comboSize().markAsTouched();
      await fixture.whenStable();

      expect(host.querySelector('#combo')).toBeTruthy();
      expect(host.textContent).toContain('Choose a combo size.');
    });

    it('disables the promo code until four seats are booked', async () => {
      const promo = (): HTMLInputElement =>
        host.querySelector<HTMLInputElement>('#promo') as HTMLInputElement;

      expect(promo().disabled).toBe(true);

      appForm().tickets().value.set(FOUR_SEATS);
      await fixture.whenStable();

      expect(promo().disabled).toBe(false);
    });

    it('gates the book button on the whole form being valid', async () => {
      expect(bookButton().disabled).toBe(true);

      appForm().tickets().value.set(FOUR_SEATS);
      await fixture.whenStable();

      expect(bookButton().disabled).toBe(false);
    });

    it('locks the form on reserve, then resets on the second click', async () => {
      appForm().tickets().value.set(FOUR_SEATS);
      await fixture.whenStable();

      // reserve
      bookButton().click();
      await fixture.whenStable();
      expect(host.textContent).toContain('Book again');
      expect(host.querySelector('[inert]')).toBeTruthy();

      // book again resets the form and re-enables editing
      bookButton().click();
      await fixture.whenStable();
      expect(host.querySelector('[inert]')).toBeNull();
      expect(appForm().tickets().value().length).toBe(0);
    });
  });
});
