import { Component, computed, inject, signal } from '@angular/core';
import { FieldTree, form, FormField, FormRoot } from '@angular/forms/signals';
import {
  NbButton,
  NbButtonTrailingIcon,
  NbCallout,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbInput,
  NbProgress,
  NbSeparator,
  NbSticker,
  NbText,
  NbTitle,
} from '@ng-brutalism/ui';
import { firstValueFrom } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerCopyright, tablerRefresh } from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';
import { INITIAL_ANSWER, Question, QuizAnswer, QuizPhase } from './app.model';
import { QUESTIONS } from './app.data';
import { answerSchema } from './app.schema';
import { GraderService } from './grader.service';
import { ValidationErrors } from './validation-errors';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    class: 'relative mx-auto flex w-2xl max-w-full shrink-0 flex-col gap-4',
  },
  imports: [
    FormRoot,
    FormField,
    NbButton,
    NbButtonTrailingIcon,
    NbCallout,
    NbChip,
    NbChipGroup,
    NbCluster,
    NbInput,
    NbProgress,
    NbSeparator,
    NbSticker,
    NbText,
    NbTitle,
    NgIcon,
    ValidationErrors,
  ],
  viewProviders: [
    provideIcons({
      tablerCircleArrowLeftFill,
      tablerCircleArrowRightFill,
      tablerCopyright,
      tablerRefresh,
    }),
  ],
})
export class App {
  private readonly grader = inject(GraderService);

  protected readonly questions = QUESTIONS;

  protected readonly index = signal(0);
  protected readonly phase = signal<QuizPhase>('answering');
  protected readonly hintShown = signal(false);

  protected readonly currentQuestion = computed(
    () => this.questions[this.index()],
  );

  protected readonly answerModel = signal<QuizAnswer>({ ...INITIAL_ANSWER });

  protected readonly answerForm = form(this.answerModel, answerSchema, {
    submission: {
      action: (field) => this.gradeSubmission(field),
      onInvalid: (field) =>
        field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      ignoreValidators: 'none',
    },
  });

  protected readonly answerField = this.answerForm.answer;

  protected readonly submitting = computed(() =>
    this.answerForm().submitting(),
  );

  protected readonly selectedValue = computed(() =>
    this.answerForm.answer().value(),
  );

  protected readonly shaking = computed(() =>
    this.answerForm
      .answer()
      .errors()
      .some((error) => error.kind === 'wrongAnswer'),
  );

  protected readonly progressValue = computed(() =>
    this.phase() === 'passed' ? this.questions.length : this.index(),
  );

  protected selectOption(value: string): void {
    this.answerForm.answer().value.set(value);
  }

  protected revealHint(): void {
    this.hintShown.set(true);
  }

  protected restart(): void {
    this.index.set(0);
    this.phase.set('answering');
    this.hintShown.set(false);
    this.answerForm().reset({ ...INITIAL_ANSWER });
  }

  private async gradeSubmission(field: FieldTree<QuizAnswer>) {
    const question: Question = this.currentQuestion();
    const result = await firstValueFrom(
      this.grader.grade(question.id, field.answer().value()),
    );

    if (result.correct) {
      queueMicrotask(() => this.advance());
      return undefined;
    }

    return {
      kind: 'wrongAnswer',
      message: result.message,
      fieldTree: field.answer,
    };
  }

  private advance(): void {
    const next = this.index() + 1;
    this.hintShown.set(false);

    if (next >= this.questions.length) {
      this.phase.set('passed');
      return;
    }

    this.index.set(next);
    this.answerForm().reset({ ...INITIAL_ANSWER });
  }
}
