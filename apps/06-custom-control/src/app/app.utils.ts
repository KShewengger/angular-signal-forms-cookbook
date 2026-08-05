import { min, SchemaPathTree, validate } from '@angular/forms/signals';
import { PizzaFormModelItem } from './app.model';
import { PIZZA_TOPPINGS_MAP } from './app.data';

export function pizzaToppingItemSchema(
  item: SchemaPathTree<PizzaFormModelItem>,
) {
  min(item.count, 0, { message: 'Count cannot be negative' });

  // add disabled > when only available in angular 22

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
