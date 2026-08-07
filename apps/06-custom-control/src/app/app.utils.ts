import {
  disabled,
  min,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import { PizzaFormModelItem } from './app.model';
import { PIZZA_TOPPINGS_MAP } from './app.data';

export function pizzaToppingItemSchema(
  item: SchemaPathTree<PizzaFormModelItem>,
) {
  min(item.count, 0, { message: 'No negative' });

  disabled(item.count, {
    when: ({ valueOf }) => {
      const value = valueOf(item.count);
      const toppingId = valueOf(item.id);
      const maxCount = PIZZA_TOPPINGS_MAP[toppingId]?.max ?? 0;

      return value >= maxCount;
    },
  });

  validate(item.count, ({ value, valueOf }) => {
    const toppingId = valueOf(item.id);
    const maxCount = PIZZA_TOPPINGS_MAP[toppingId]?.max ?? 0;

    if (value() > maxCount) {
      return {
        kind: 'toppingMax',
        message: `Max ${maxCount}`,
      };
    }
    return null;
  });
}
