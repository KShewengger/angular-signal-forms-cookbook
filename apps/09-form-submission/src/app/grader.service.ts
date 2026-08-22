import { Service } from '@angular/core';
import { QUESTIONS } from './app.data';
import { GradeResult } from './app.model';

@Service()
export class GraderService {
  grade(questionId: string, answer: string): Promise<GradeResult> {
    const question = QUESTIONS.find((entry) => entry.id === questionId);
    const correct =
      question !== undefined && answer.trim().toLowerCase() === question.answer;

    const result: GradeResult = correct
      ? { correct: true }
      : {
          correct: false,
          message: $localize`:@@wrongAnswer:Not quite, try again.`,
        };

    return new Promise<GradeResult>((resolve) =>
      setTimeout(() => resolve(result), 500),
    );
  }
}
