import { Service } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { GradeResult } from './app.model';
import { evaluateAnswer } from './app.utils';

@Service()
export class GraderService {
  grade(questionId: string, answer: string): Observable<GradeResult> {
    return of(evaluateAnswer(questionId, answer)).pipe(delay(700));
  }
}
