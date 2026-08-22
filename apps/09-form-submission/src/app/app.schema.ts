import { required, schema } from '@angular/forms/signals';
import { QuizAnswer } from './app.model';

export const answerSchema = schema<QuizAnswer>((path) => {
  required(path.answer, {
    message: 'Answer this question before submitting.',
  });
});
