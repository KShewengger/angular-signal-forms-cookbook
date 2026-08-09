import type { Fruit } from './app.model';

export const FRUITS: Fruit[] = [
  { name: 'Apple', emoji: '🍎' },
  { name: 'Banana', emoji: '🍌' },
  { name: 'Cherry', emoji: '🍒' },
  { name: 'Grapes', emoji: '🍇' },
  { name: 'Lemon', emoji: '🍋' },
  { name: 'Mango', emoji: '🥭' },
  { name: 'Orange', emoji: '🍊' },
  { name: 'Peach', emoji: '🍑' },
  { name: 'Pineapple', emoji: '🍍' },
  { name: 'Strawberry', emoji: '🍓' },
];

export const QUERY_PATTERN = /^[a-zA-Z0-9\s]*$/;
export const ALLOWED_FRUITS = FRUITS.map((fruit) => fruit.name).join(', ');
