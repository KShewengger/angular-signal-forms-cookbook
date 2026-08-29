import type { FieldTree } from '@angular/forms/signals';
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

export function variantOf<TUnion, TVariant extends TUnion>(
  field: FieldTree<TUnion>,
  isVariant: (value: TUnion) => value is TVariant,
  variantName: string,
): FieldTree<TVariant> {
  if (!isVariant(field().value())) {
    throw new Error(`Read the ${variantName} variant while it was not active.`);
  }

  return field as unknown as FieldTree<TVariant>;
}
