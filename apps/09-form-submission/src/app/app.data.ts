import type { Question } from './app.model';

export const TOTAL_HEARTS = 3;

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    kind: 'text',
    prompt: $localize`:@@q1Prompt:Which function builds a form from a model signal?`,
    answer: 'form',
    hint: $localize`:@@q1Hint:Four letters, starts with "f".`,
  },
  {
    id: 'q2',
    kind: 'choice',
    prompt: $localize`:@@q2Prompt:Which signal is true while the submit action runs?`,
    answer: 'submitting',
    hint: $localize`:@@q2Hint:It is the one that ends in "-ing".`,
    options: [
      { value: 'submitting', label: 'submitting()' },
      { value: 'pending', label: 'pending()' },
      { value: 'touched', label: 'touched()' },
      { value: 'valid', label: 'valid()' },
    ],
  },
];
