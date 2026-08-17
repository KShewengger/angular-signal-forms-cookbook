import {
  applyEach,
  applyWhen,
  applyWhenValue,
  disabled,
  min,
  required,
  schema,
} from '@angular/forms/signals';

export type Ticket = {
  seat: string;
  age: number;
};

export type Experience =
  | { format: 'standard' }
  | { format: 'imax'; glasses: number }
  | { format: 'vip'; mealChoice: string };

export type Booking = {
  tickets: Ticket[];
  addSnacks: boolean;
  comboSize: string;
  experience: Experience;
  promoCode: string;
};

export const bookingSchema = schema<Booking>((path) => {
  applyEach(path.tickets, (ticket) => {
    required(ticket.seat);
    min(ticket.age, 0);
  });

  applyWhen(
    path,
    ({ valueOf }) => valueOf(path.addSnacks),
    (path) => required(path.comboSize),
  );

  applyWhenValue(
    path.experience,
    (experience) => experience.format === 'imax',
    (imax) => min(imax.glasses, 1),
  );

  applyWhenValue(
    path.experience,
    (experience) => experience.format === 'vip',
    (vip) => required(vip.mealChoice),
  );

  disabled(path.promoCode, {
    when: ({ valueOf }) => valueOf(path.tickets).length < 4,
  });
});
