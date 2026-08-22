import { Service } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { QUESTIONS } from './app.data';

@Service()
export class GraderService {
  grade(questionId: string, answer: string): Observable<boolean> {
    const question = QUESTIONS.find((entry) => entry.id === questionId);
    const correct =
      question !== undefined && answer.trim().toLowerCase() === question.answer;

    return of(correct).pipe(delay(700));
  }
}
