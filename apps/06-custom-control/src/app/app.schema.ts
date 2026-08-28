import {
  apply,
  applyEach,
  disabled,
  hidden,
  min,
  schema,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import { PIZZA_TOPPINGS_MAP } from './app.data';
import { PizzaFormModel, PizzaFormModelItem } from './app.model';

export const pizzaToppingItemSchema = schema<PizzaFormModelItem>((item) => {
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
});

export function pizzaMakerSchema(path: SchemaPathTree<PizzaFormModel>): void {
  applyEach(path.toppings, (topping) => {
    apply(topping, pizzaToppingItemSchema);

    hidden(topping.count, {
      when: ({ valueOf }) => {
        if (valueOf(topping.id) !== 'pepperoni') return false;

        const tomato = valueOf(path.toppings).find((t) => t.id === 'tomato');

        return (tomato?.count ?? 0) > 1;
      },
    });
  });
}
