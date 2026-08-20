import {
  applyEach,
  min,
  schema,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import { PIZZA_TOPPINGS_MAP } from './app.data';
import { PizzaFormModel, PizzaFormModelItem } from './app.model';

export function pizzaToppingItemSchema(
  item: SchemaPathTree<PizzaFormModelItem>,
) {
  min(item.count, 0, { message: 'Count cannot be negative' });

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

export const pizzaMakerSchema = schema<PizzaFormModel>((path) => {
  applyEach(path.toppings, pizzaToppingItemSchema);
});
