import {
  applyEach,
  applyWhen,
  applyWhenValue,
  disabled,
  min,
  required,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import { PROMO_CODE } from './app.data';
import { Booking, isImaxExperience, isVipExperience } from './app.model';

export function bookingSchema(path: SchemaPathTree<Booking>): void {
  applyEach(path.tickets, (ticket) => {
    required(ticket.seat);
  });

  applyWhen(
    path,
    ({ valueOf }) => valueOf(path.addSnacks),
    (path) => required(path.comboSize),
  );

  applyWhenValue(path.experience, isImaxExperience, (imax) => {
    required(imax.glasses);
    min(imax.glasses, 1);
  });

  applyWhenValue(path.experience, isVipExperience, (vip) =>
    required(vip.mealChoice),
  );

  disabled(path.promoCode, {
    when: ({ valueOf }) => valueOf(path.tickets).length < 4,
  });

  validate(path.promoCode, ({ value }) => {
    const code = value().trim();

    if (!code || code.toUpperCase() === PROMO_CODE) return null;

    return { kind: 'invalidCoupon', message: 'Invalid coupon.' };
  });
}
