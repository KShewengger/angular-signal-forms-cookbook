export type Fruit = {
  name: string;
  emoji: string;
};

export type SearchFormModel = {
  query: string;
};

export const INITIAL_SEARCH: SearchFormModel = {
  query: '',
};
