import {
  applyEach,
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

// Per-item schema, applied to every topping in the array via applyEach.
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

// Extracting the schema keeps it reusable: the component builds its form from it,
// and the tests build the same form in isolation without rendering a component.
export const pizzaMakerSchema = schema<PizzaFormModel>((path) => {
  applyEach(path.toppings, pizzaToppingItemSchema);
});
