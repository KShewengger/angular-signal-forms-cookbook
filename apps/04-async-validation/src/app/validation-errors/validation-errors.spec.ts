import { ApplicationRef, Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { form, type FieldTree } from '@angular/forms/signals';
import { BookingFormModel, INITIAL_BOOKING } from '../app.model';
import { bookingSchema } from '../app.schema';
import { mockHttpInterceptor } from '../../mock.interceptor';
import { ValidationErrors } from './validation-errors';

describe('ValidationErrors (04 · Async Validation)', () => {
  let fixture: ComponentFixture<ValidationErrors>;
  let host: HTMLElement;

  const buildBookingForm = (
    initial: Partial<BookingFormModel> = {},
  ): FieldTree<BookingFormModel> => {
    const model = signal<BookingFormModel>({ ...INITIAL_BOOKING, ...initial });
    return form(model, bookingSchema, { injector: TestBed.inject(Injector) });
  };

  // Let the async `validateHttp` check settle before asserting.
  const settle = (): Promise<void> =>
    TestBed.inject(ApplicationRef).whenStable();

  const showErrorsFor = async (field: FieldTree<unknown>): Promise<void> => {
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  };

  const errorList = (): HTMLUListElement | null => host.querySelector('ul');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ValidationErrors],
      providers: [provideHttpClient(withInterceptors([mockHttpInterceptor]))],
    });
    fixture = TestBed.createComponent(ValidationErrors);
    host = fixture.nativeElement as HTMLElement;
  });

  describe('visibility', () => {
    it('renders nothing while the field is pristine and untouched', async () => {
      await showErrorsFor(buildBookingForm().reference);

      expect(errorList()).toBeNull();
    });

    it('renders nothing for a valid field, even after it is touched', async () => {
      const referenceField = buildBookingForm({
        reference: 'ABC1234',
      }).reference;
      referenceField().markAsTouched();
      await showErrorsFor(referenceField);
      await settle();
      await fixture.whenStable();

      expect(errorList()).toBeNull();
    });

    it('shows the errors once an invalid field is touched', async () => {
      const referenceField = buildBookingForm().reference;
      referenceField().markAsTouched();
      await showErrorsFor(referenceField);

      expect(errorList()).not.toBeNull();
    });

    it('shows the errors once an invalid field is dirty', async () => {
      const lastNameField = buildBookingForm().lastName;
      lastNameField().markAsDirty();
      await showErrorsFor(lastNameField);

      expect(errorList()).not.toBeNull();
    });
  });

  describe('rendering the real recipe errors', () => {
    it("surfaces the reference 'required' message", async () => {
      const referenceField = buildBookingForm().reference;
      referenceField().markAsTouched();
      await showErrorsFor(referenceField);

      expect(host.textContent).toContain(
        'Please enter your booking reference.',
      );
    });

    it('surfaces the async bookingNotFound message for an unknown reference', async () => {
      const referenceField = buildBookingForm({
        reference: 'ZZZ0000',
      }).reference;
      referenceField().markAsTouched();
      await showErrorsFor(referenceField);
      await settle();
      await fixture.whenStable();

      expect(host.textContent).toContain('Booking does not exist.');
    });

    it("surfaces the last-name 'required' message", async () => {
      const lastNameField = buildBookingForm().lastName;
      lastNameField().markAsTouched();
      await showErrorsFor(lastNameField);

      expect(host.textContent).toContain('Please enter your last name.');
    });

    it('renders a flat list for a single error', async () => {
      const referenceField = buildBookingForm().reference;
      referenceField().markAsTouched();
      await showErrorsFor(referenceField);

      const list = errorList();
      expect(list?.classList.contains('list-disc')).toBe(false);
      expect(host.querySelectorAll('li').length).toBe(1);
    });
  });

  describe('accessibility', () => {
    it('exposes the errors to assistive technology', async () => {
      const referenceField = buildBookingForm().reference;
      referenceField().markAsTouched();
      await showErrorsFor(referenceField);

      const list = errorList();
      expect(list?.getAttribute('role')).toBe('alert');
    });
  });
});
