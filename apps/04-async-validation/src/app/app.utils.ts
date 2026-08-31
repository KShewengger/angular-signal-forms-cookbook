import { formatDate } from '@angular/common';
import { BookingFormModel, UserBooking } from './app.model';

export function generateMockBookingResponse(
  payload: BookingFormModel,
): UserBooking {
  const departure = new Date();

  departure.setDate(departure.getDate() + 14);
  departure.setHours(7, 30, 0, 0);

  const arrival = new Date(departure);

  arrival.setMinutes(arrival.getMinutes() + 100);

  return {
    id: 'booking_01',
    reference: payload.reference,
    passenger: {
      firstName: 'Kristy Mae',
      lastName: payload.lastName,
    },
    flight: {
      number: 'PR 1814',
      origin: 'Resource',
      destination: 'Signals',
      departureAt: formatDate(departure, 'medium', 'en-PH'),
      arrivalAt: formatDate(arrival, 'medium', 'en-PH'),
    },
    status: 'Confirmed',
  };
}
