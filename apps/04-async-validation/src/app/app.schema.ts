import {
  debounce,
  required,
  schema,
  validateHttp,
} from '@angular/forms/signals';
import { BookingFormModel } from './app.model';

export const bookingSchema = schema<BookingFormModel>((path) => {
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
