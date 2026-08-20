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
