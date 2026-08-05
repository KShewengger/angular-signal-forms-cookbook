import {
  debounce,
  required,
  schema,
  validateHttp,
} from '@angular/forms/signals';

export type BookingFormModel = {
  reference: string;
  lastName: string;
};

export const INITIAL_BOOKING: BookingFormModel = {
  reference: '',
  lastName: '',
};

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

export interface UserBooking {
  id: string;
  reference: string;

  passenger: {
    firstName: string;
    lastName: string;
  };

  flight: {
    number: string;
    origin: string;
    destination: string;
    departureAt: string;
    arrivalAt: string;
  };

  status: 'Confirmed' | 'Pending' | 'Cancelled';
}
