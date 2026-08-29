export type Ticket = {
  seat: string;
};

export type Experience =
  | { format: 'standard' }
  | { format: 'imax'; glasses: number | null }
  | { format: 'vip'; mealChoice: string };

export type ImaxExperience = Extract<Experience, { format: 'imax' }>;
export type VipExperience = Extract<Experience, { format: 'vip' }>;

export function isImaxExperience(
  experience: Experience,
): experience is ImaxExperience {
  return experience.format === 'imax';
}

export function isVipExperience(
  experience: Experience,
): experience is VipExperience {
  return experience.format === 'vip';
}

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
