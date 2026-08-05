export type BookingFormModel = {
  reference: string;
  lastName: string;
};

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
