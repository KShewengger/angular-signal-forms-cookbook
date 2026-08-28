import type { Experience } from './app.model';

export function fieldInvalid(field: {
  dirty(): boolean;
  touched(): boolean;
  invalid(): boolean;
}): boolean {
  return (field.dirty() || field.touched()) && field.invalid();
}

export function createExperience(format: Experience['format']): Experience {
  switch (format) {
    case 'imax':
      return { format, glasses: null };
    case 'vip':
      return { format, mealChoice: '' };
    case 'standard':
      return { format };
  }
}
