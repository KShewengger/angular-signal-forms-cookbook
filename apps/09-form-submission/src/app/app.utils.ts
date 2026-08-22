import { QUESTIONS } from './app.data';
import { GradeResult } from './app.model';

export function evaluateAnswer(
  questionId: string,
  answer: string,
): GradeResult {
  const question = QUESTIONS.find((entry) => entry.id === questionId);
  const correct =
    question !== undefined && answer.trim().toLowerCase() === question.answer;

  if (correct) return { correct: true };

  return {
    correct: false,
    message: $localize`:@@wrongAnswer:Not quite, try again.`,
  };
}
