import { Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  form,
  FormField,
  required,
  validateHttp,
  debounce,
} from '@angular/forms/signals';
import {
  NbCard,
  NbCardHeader,
  NbCardTitle,
  NbCardActions,
  NbCardContent,
  NbButton,
  NbInput,
  NbDisplay,
  NbChip,
  NbChipGroup,
  NbSticker,
  NbSeparator,
  NbInputGroup,
  NbInputSuffix,
  NbCluster,
  NbText,
  NbCallout,
  NbMediaFrame,
  NbStack,
  NbProgress,
  NbButtonTrailingIcon,
} from '@ng-brutalism/ui';
import { BookingFormModel } from './app.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  tablerUserCheck,
  tablerCopyright,
  tablerArrowRight,
  tablerRocket,
  tablerArrowLeft,
  tablerPlaneDeparture,
  tablerPlaneArrival,
  tablerNotebook,
  tablerCheck,
} from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';
import { delay, of } from 'rxjs';
import { generateMockBookingResponse } from './app.utils';
import { BookingInfo } from './booking-info/booking-info';
import { ValidationErrors } from './validation-errors';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  imports: [
    NgOptimizedImage,
    NbButton,
    NbCard,
    NbProgress,
    NbCluster,
    NbCardHeader,
    NbCardTitle,
    NbCardActions,
    NbCardContent,
    NbInputSuffix,
    NbInput,
    NbInputGroup,
    NbStack,
    NbDisplay,
    NbChip,
    NbChipGroup,
    NbSticker,
    NbSeparator,
    FormField,
    NbCallout,
    NgIcon,
    NbText,
    NbMediaFrame,
    BookingInfo,
    ValidationErrors,
    NbButtonTrailingIcon,
  ],
  providers: [
    provideIcons({
      tablerUserCheck,
      tablerCopyright,
      tablerArrowRight,
      tablerArrowLeft,
      tablerRocket,
      tablerNotebook,
      tablerPlaneDeparture,
      tablerPlaneArrival,
      tablerCheck,
      tablerCircleArrowRightFill,
      tablerCircleArrowLeftFill,
    }),
  ],
  host: {
    class: 'relative flex flex-col gap-6 mx-auto w-3xl shrink-0',
  },
})
export class App {
  protected payload = signal<BookingFormModel | undefined>(undefined);

  private userModel = signal<BookingFormModel>({
    reference: '',
    lastName: '',
  });

  protected bookingForm = form(this.userModel, (path) => {
    required(path.reference, {
      message: 'Please enter your booking reference.',
    });
    debounce(path.reference, 500);
    validateHttp(path.reference, {
      request: ({ value }) => `/api/bookings/${value().trim()}`,

      onSuccess: (response: { exists: boolean }) =>
        response.exists
          ? null
          : {
              kind: 'bookingNotFound',
              message: 'Booking does not exist.',
            },

      onError: () => ({
        kind: 'networkError',
        message: 'Could not verify the booking.',
      }),
    });
    required(path.lastName, {
      message: 'Please enter your last name.',
    });
  });

  protected value = computed(() => this.bookingForm().value());

  private bookingResource = rxResource({
    params: this.payload,
    stream: ({ params }) =>
      of(generateMockBookingResponse(params)).pipe(delay(1000)),
  });

  protected loading = this.bookingResource.isLoading;
  protected hasBookingInfo = this.bookingResource.hasValue;
  protected bookingInfo = this.bookingResource.value;
  protected resolved = computed(
    () => this.bookingResource.status() === 'resolved',
  );

  protected clear() {
    this.payload.set(undefined);
    this.bookingForm().reset({
      reference: '',
      lastName: '',
    });
  }
}
