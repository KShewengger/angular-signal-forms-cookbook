import type { Experience } from './app.model';

export type ExperienceOption = {
  format: Experience['format'];
  label: string;
  price: number;
  code: string;
};

export const EXPERIENCES: ExperienceOption[] = [
  { format: 'standard', label: 'Standard', price: 14, code: 'STD·001' },
  { format: 'imax', label: 'IMAX 3D', price: 19, code: 'MAX·002' },
  { format: 'vip', label: 'VIP Dine-in', price: 32, code: 'VIP·003' },
];
