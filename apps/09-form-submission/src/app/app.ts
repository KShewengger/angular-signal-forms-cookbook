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
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerCopyright } from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';
import { INITIAL_ANSWER, Question, QuizAnswer, QuizPhase } from './app.model';
import { QUESTIONS, TOTAL_HEARTS } from './app.data';
import { answerSchema } from './app.schema';
import { GraderService } from './grader.service';

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
  ],
  viewProviders: [
    provideIcons({
      tablerCircleArrowLeftFill,
      tablerCircleArrowRightFill,
      tablerCopyright,
    }),
  ],
})
export class App {
  private readonly grader = inject(GraderService);

  protected readonly questions = QUESTIONS;

  protected readonly index = signal(0);
  protected readonly hearts = signal(TOTAL_HEARTS);
  protected readonly phase = signal<QuizPhase>('answering');
  protected readonly shaking = signal(false);
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

  protected readonly submitting = this.answerForm().submitting;

  protected readonly selectedValue = this.answerForm.answer().value;

  protected readonly showFieldError = computed(() => {
    const field = this.answerForm.answer();
    return (field.touched() || field.dirty()) && field.errors().length > 0;
  });

  protected readonly fieldErrorMessage = computed(
    () => this.answerForm.answer().errors()[0]?.message ?? '',
  );

  protected readonly formErrorMessage = computed(
    () =>
      this.answerForm()
        .errors()
        .find((error) => error.kind === 'locked')?.message ?? '',
  );

  protected selectOption(value: string): void {
    this.answerForm.answer().value.set(value);
  }

  protected revealHint(): void {
    this.hintShown.set(true);
  }

  protected restart(): void {
    this.index.set(0);
    this.hearts.set(TOTAL_HEARTS);
    this.phase.set('answering');
    this.hintShown.set(false);
    this.answerForm().reset({ ...INITIAL_ANSWER });
  }

  private async gradeSubmission(field: FieldTree<QuizAnswer>) {
    const question: Question = this.currentQuestion();
    const correct = await this.grader.grade(
      question.id,
      field.answer().value(),
    );

    if (correct) {
      queueMicrotask(() => this.advance());
      return undefined;
    }

    const remaining = this.hearts() - 1;
    this.hearts.set(remaining);
    this.triggerShake();

    if (remaining <= 0) {
      queueMicrotask(() => this.phase.set('locked'));
      return {
        kind: 'locked',
        message: $localize`:@@lockedError:Out of tries, the deck is locked.`,
      };
    }

    return {
      kind: 'wrongAnswer',
      message: $localize`:@@wrongAnswer:Not quite, try again.`,
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

  private triggerShake(): void {
    this.shaking.set(true);
    setTimeout(() => this.shaking.set(false), 420);
  }
}
