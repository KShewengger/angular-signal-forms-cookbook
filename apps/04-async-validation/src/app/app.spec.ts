import { ApplicationRef, Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { form, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import { BookingFormModel, INITIAL_BOOKING, bookingSchema } from './app.model';
import { mockHttpInterceptor } from '../mock.interceptor';

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
  initial: Partial<BookingFormModel> = {},
): FieldTree<BookingFormModel> => {
  const model = signal<BookingFormModel>({ ...INITIAL_BOOKING, ...initial });
  return form(model, bookingSchema, { injector: TestBed.inject(Injector) });
};

const settle = (): Promise<void> => TestBed.inject(ApplicationRef).whenStable();

describe('App (04 · Async Validation)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        providers: [provideHttpClient(withInterceptors([mockHttpInterceptor]))],
      }),
    );

    describe('reference', () => {
      it('is required (synchronously, before any request)', () => {
        const bookingForm = buildBookingForm();
        expect(bookingForm.reference().valid()).toBe(false);
        expect(messagesOf(bookingForm.reference)).toContain(
          'Please enter your booking reference.',
        );
      });

      it('accepts a known booking reference once the async check resolves', async () => {
        const bookingForm = buildBookingForm({ reference: 'ABC1234' });
        await settle();

        expect(kindsOf(bookingForm.reference)).not.toContain('bookingNotFound');
        expect(bookingForm.reference().valid()).toBe(true);
      });

      it('rejects an unknown booking reference with bookingNotFound', async () => {
        const bookingForm = buildBookingForm({ reference: 'ZZZ0000' });
        await settle();

        expect(kindsOf(bookingForm.reference)).toContain('bookingNotFound');
        expect(messagesOf(bookingForm.reference)).toContain(
          'Booking does not exist.',
        );
        expect(bookingForm.reference().valid()).toBe(false);
      });

      it('ignores letter case when checking the reference', async () => {
        const bookingForm = buildBookingForm({ reference: 'abc1234' });
        await settle();

        expect(kindsOf(bookingForm.reference)).not.toContain('bookingNotFound');
        expect(bookingForm.reference().valid()).toBe(true);
      });
    });

    describe('lastName', () => {
      it('is required', () => {
        const bookingForm = buildBookingForm();
        expect(messagesOf(bookingForm.lastName)).toContain(
          'Please enter your last name.',
        );
      });

      it('accepts any non-empty value', () => {
        const bookingForm = buildBookingForm({ lastName: 'Almuete' });
        expect(bookingForm.lastName().valid()).toBe(true);
      });
    });

    describe('form as a whole', () => {
      it('is invalid while empty', () => {
        const bookingForm = buildBookingForm();
        expect(bookingForm().valid()).toBe(false);
        expect(bookingForm().invalid()).toBe(true);
      });

      it('becomes valid once a known reference and last name are provided', async () => {
        const bookingForm = buildBookingForm({
          reference: 'ABC1234',
          lastName: 'Almuete',
        });
        await settle();

        expect(bookingForm().valid()).toBe(true);
      });
    });
  });

  describe('network failure (the onError branch)', () => {
    const failingInterceptor: HttpInterceptorFn = () =>
      throwError(
        () =>
          new HttpErrorResponse({ status: 500, statusText: 'Server Error' }),
      );

    beforeEach(() =>
      TestBed.configureTestingModule({
        providers: [provideHttpClient(withInterceptors([failingInterceptor]))],
      }),
    );

    it('surfaces networkError when the check cannot complete', async () => {
      const bookingForm = buildBookingForm({ reference: 'ABC1234' });
      await settle();

      expect(kindsOf(bookingForm.reference)).toContain('networkError');
      expect(messagesOf(bookingForm.reference)).toContain(
        'Could not verify the booking.',
      );
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const bookingForm = (): FieldTree<BookingFormModel> =>
      (
        fixture.componentInstance as unknown as {
          bookingForm: FieldTree<BookingFormModel>;
        }
      ).bookingForm;

    const controlById = <T extends HTMLElement>(id: string): T =>
      host.querySelector<T>(`#${id}`) as T;

    const buttonByText = (text: string): HTMLButtonElement =>
      Array.from(host.querySelectorAll('button')).find((button) =>
        button.textContent?.trim().startsWith(text),
      ) as HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
        providers: [provideHttpClient(withInterceptors([mockHttpInterceptor]))],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('renders the reference and last-name controls', () => {
      expect(controlById('reference')).toBeTruthy();
      expect(controlById('last-name')).toBeTruthy();
      expect(buttonByText('Find my booking')).toBeTruthy();
    });

    it('disables the submit button on a pristine form', () => {
      expect(buttonByText('Find my booking').disabled).toBe(true);
    });

    it('shows the reference required message after it is touched', async () => {
      bookingForm().reference().markAsTouched();
      await fixture.whenStable();

      expect(host.textContent).toContain(
        'Please enter your booking reference.',
      );
    });

    it('resolves a known booking and shows the booking info on submit', async () => {
      bookingForm().reference().value.set('ABC1234');
      bookingForm().lastName().value.set('Almuete');
      bookingForm().reference().markAsDirty();
      await fixture.whenStable();

      const submit = buttonByText('Find my booking');
      expect(submit.disabled).toBe(false);

      submit.click();
      await fixture.whenStable();

      expect(host.textContent).toContain('ABC1234');
      expect(host.textContent).toContain('Kristy Mae');
    });
  });
});
