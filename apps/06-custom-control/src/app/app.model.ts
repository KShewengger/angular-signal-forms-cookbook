import {
  applyEach,
  disabled,
  hidden,
  min,
  schema,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import { PIZZA_TOPPINGS_MAP } from './app.data';

export type PizzaToppingId = 'pepperoni' | 'basil' | 'mozzarella' | 'tomato';

export type PizzaSlot = {
  x: number;
  y: number;
};

export type PizzaTopping = {
  id: PizzaToppingId;
  label: string;
  imgUrl: string;
  max: number;
  width: number;
  height: number;
  zIndex: number;
  slots: PizzaSlot[];
};

export type RenderPizzaTopping = PizzaTopping & {
  positions: {
    width: number;
    left: number;
    top: number;
  }[];
};

export type PizzaFormModelItem = { id: PizzaToppingId; count: number };

export type PizzaFormModel = {
  toppings: PizzaFormModelItem[];
};

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

export const pizzaMakerSchema = schema<PizzaFormModel>((path) => {
  applyEach(path.toppings, (topping) => {
    pizzaToppingItemSchema(topping);

    hidden(topping.count, {
      when: ({ valueOf }) => {
        if (valueOf(topping.id) !== 'pepperoni') return false;

        const tomato = valueOf(path.toppings).find((t) => t.id === 'tomato');
        return (tomato?.count ?? 0) > 1;
      },
    });
  });
});
