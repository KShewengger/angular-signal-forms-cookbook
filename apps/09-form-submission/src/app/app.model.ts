export type QuizAnswer = {
  answer: string;
};

export const INITIAL_ANSWER: QuizAnswer = {
  answer: '',
};

export type QuestionKind = 'text' | 'choice';

export type QuestionOption = {
  value: string;
  label: string;
};

export type Question = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  answer: string;
  hint: string;
  options?: QuestionOption[];
};

export type QuizPhase = 'answering' | 'passed';

export type GradeResult =
  | { correct: true }
  | { correct: false; message: string };
