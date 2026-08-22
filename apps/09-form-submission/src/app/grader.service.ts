import { Injectable, InjectionToken, inject } from '@angular/core';
import { QUESTIONS } from './app.data';

export const GRADER_LATENCY_MS = new InjectionToken<number>(
  'GRADER_LATENCY_MS',
  {
    providedIn: 'root',
    factory: () => 700,
  },
);

@Injectable({ providedIn: 'root' })
export class GraderService {
  private readonly latencyMs = inject(GRADER_LATENCY_MS);

  async grade(questionId: string, answer: string): Promise<boolean> {
    await this.delay();

    const question = QUESTIONS.find((entry) => entry.id === questionId);
    if (!question) return false;

    return answer.trim().toLowerCase() === question.answer;
  }

  private delay(): Promise<void> {
    return this.latencyMs > 0
      ? new Promise((resolve) => setTimeout(resolve, this.latencyMs))
      : Promise.resolve();
  }
}
