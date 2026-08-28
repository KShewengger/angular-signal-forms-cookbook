import type { Experience } from './app.model';

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
