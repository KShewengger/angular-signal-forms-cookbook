import type { PizzaTopping, RenderPizzaTopping } from './app.model';
import { calculatePct } from './app.utils';

export const PIZZA_TOPPINGS_MAP: Record<string, PizzaTopping> = {
  mozzarella: {
    id: 'mozzarella',
    label: 'Mozzarella',
    imgUrl: 'mozarella.svg',
    max: 1,
    width: 140,
    height: 108,
    zIndex: 1,
    slots: [{ x: 137, y: 90 }],
  },
  tomato: {
    id: 'tomato',
    label: 'Tomato',
    imgUrl: 'tomato.svg',
    max: 4,
    width: 50,
    height: 37.5,
    zIndex: 2,
    slots: [
      { x: 183, y: 90 },
      { x: 91, y: 90 },
      { x: 137, y: 52 },
      { x: 137, y: 124 },
    ],
  },
  basil: {
    id: 'basil',
    label: 'Basil',
    imgUrl: 'basil.svg',
    max: 3,
    width: 30,
    height: 30,
    zIndex: 4,
    slots: [
      { x: 122, y: 76 },
      { x: 160, y: 100 },
      { x: 113, y: 110 },
    ],
  },
  pepperoni: {
    id: 'pepperoni',
    label: 'Pepperoni',
    imgUrl: 'pepperoni.svg',
    max: 5,
    width: 48,
    height: 33,
    zIndex: 3,
    slots: [
      { x: 137, y: 88 },
      { x: 103, y: 63 },
      { x: 171, y: 113 },
      { x: 171, y: 63 },
      { x: 103, y: 113 },
    ],
  },
};

const PIZZA_BOARD_SIZE = { width: 250, height: 180 };

export const PIZZA_TOPPINGS: RenderPizzaTopping[] = Object.values(
  PIZZA_TOPPINGS_MAP,
).map((topping) => {
  return {
    ...topping,
    positions: topping.slots.map((slot) => ({
      width: calculatePct(topping.width, PIZZA_BOARD_SIZE.width),
      left: calculatePct(slot.x - topping.width / 2, PIZZA_BOARD_SIZE.width),
      top: calculatePct(slot.y - topping.height / 2, PIZZA_BOARD_SIZE.height),
    })),
  };
});
