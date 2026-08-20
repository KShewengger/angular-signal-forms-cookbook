import type { ExperienceOption, Seat, SeatLegendItem } from './app.model';

export const EXPERIENCES: ExperienceOption[] = [
  { format: 'standard', label: 'Standard', price: 14, code: 'STD·001' },
  { format: 'imax', label: 'IMAX 3D', price: 19, code: 'MAX·002' },
  { format: 'vip', label: 'VIP Dine-in', price: 32, code: 'VIP·003' },
];

export const MEALS: string[] = [
  'Truffle fries + soda',
  'Wagyu slider trio',
  'Margherita flatbread',
  'Vegan buddha bowl',
];

export const COMBO_SIZES: string[] = ['Small', 'Medium', 'Large'];

export const PROMO_CODE = 'SQUAD50';

export const SEATS: Seat[] = [
  { id: 'R1', taken: false },
  { id: 'R2', taken: false },
  { id: 'R3', taken: true },
  { id: 'R4', taken: false },
  { id: 'R5', taken: false },
  { id: 'R6', taken: true },
  { id: 'R7', taken: false },
  { id: 'R8', taken: false },
];

export const SEAT_LEGEND: SeatLegendItem[] = [
  {
    label: $localize`:@@seatAvailableLabel:Available`,
    swatchClass: 'bg-white',
  },
  { label: $localize`:@@seatYoursLabel:Yours`, swatchClass: 'bg-nb-blue' },
  { label: $localize`:@@seatTakenLabel:Taken`, swatchClass: 'seat-taken' },
];
