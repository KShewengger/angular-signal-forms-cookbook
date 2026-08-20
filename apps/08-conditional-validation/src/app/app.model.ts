import {
  applyEach,
  applyWhen,
  applyWhenValue,
  disabled,
  min,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { PROMO_CODE } from './app.data';

export type Ticket = {
  seat: string;
};

export type Experience =
  | { format: 'standard' }
  | { format: 'imax'; glasses: number | null }
  | { format: 'vip'; mealChoice: string };

export type ImaxExperience = Extract<Experience, { format: 'imax' }>;
export type VipExperience = Extract<Experience, { format: 'vip' }>;

export type Booking = {
  tickets: Ticket[];
  addSnacks: boolean;
  comboSize: string;
  experience: Experience;
  promoCode: string;
};

export const INITIAL_BOOKING: Booking = {
  tickets: [],
  addSnacks: false,
  comboSize: '',
  experience: { format: 'standard' },
  promoCode: '',
};

export type ExperienceOption = {
  format: Experience['format'];
  label: string;
  price: number;
  code: string;
};

export type Seat = {
  id: string;
  taken: boolean;
};

export type SeatLegendItem = {
  label: string;
  swatchClass: string;
};

export const bookingSchema = schema<Booking>((path) => {
  applyEach(path.tickets, (ticket) => {
    required(ticket.seat);
  });

  applyWhen(
    path,
    ({ valueOf }) => valueOf(path.addSnacks),
    (path) => required(path.comboSize),
  );

  applyWhenValue(
    path.experience,
    (experience): experience is Extract<Experience, { format: 'imax' }> =>
      experience.format === 'imax',
    (imax) => {
      required(imax.glasses);
      min(imax.glasses, 1);
    },
  );

  applyWhenValue(
    path.experience,
    (experience): experience is Extract<Experience, { format: 'vip' }> =>
      experience.format === 'vip',
    (vip) => required(vip.mealChoice),
  );

  disabled(path.promoCode, {
    when: ({ valueOf }) => valueOf(path.tickets).length < 4,
  });

  validate(path.promoCode, ({ value }) => {
    const code = value().trim();

    if (!code || code.toUpperCase() === PROMO_CODE) return null;

    return { kind: 'invalidCoupon', message: 'Invalid coupon.' };
  });
});
