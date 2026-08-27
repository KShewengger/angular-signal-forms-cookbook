import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, required, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import { INITIAL_ANSWER, QuizAnswer } from './app.model';
import { GraderService } from './grader.service';

const GRADE_DELAY_MS = 500;

const buildAnswerForm = (value = ''): FieldTree<QuizAnswer> => {
  const model = signal<QuizAnswer>({ ...INITIAL_ANSWER, answer: value });
  return form(
    model,
    (path) => {
      required(path.answer, {
        message: 'Answer this question before submitting.',
      });
    },
    { injector: TestBed.inject(Injector) },
  );
};

describe('App (09 · Form Submission)', () => {
  describe('answer schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('requires an answer', () => {
      const answerForm = buildAnswerForm('');
      expect(answerForm.answer().valid()).toBe(false);
      expect(answerForm.answer().errors()[0].kind).toBe('required');
    });

    it('is valid once an answer is present', () => {
      const answerForm = buildAnswerForm('form');
      expect(answerForm.answer().valid()).toBe(true);
    });
  });

  describe('grader service (the mock server)', () => {
    let grader: GraderService;

    beforeEach(() => {
      vi.useFakeTimers();
      TestBed.configureTestingModule({});
      grader = TestBed.inject(GraderService);
    });

    afterEach(() => vi.useRealTimers());

    it('accepts the right answer, case-insensitively and trimmed', async () => {
      const q1 = grader.grade('q1', '  Form ');
      const q2 = grader.grade('q2', 'submitting');
      await vi.advanceTimersByTimeAsync(GRADE_DELAY_MS);
      expect(await q1).toEqual({ correct: true });
      expect(await q2).toEqual({ correct: true });
    });

    it('reports a wrong answer', async () => {
      const result = grader.grade('q1', 'schema');
      await vi.advanceTimersByTimeAsync(GRADE_DELAY_MS);
      expect(await result).toEqual({
        correct: false,
        message: 'Not quite, try again.',
      });
    });

    it('treats an unknown question as wrong', async () => {
      const result = grader.grade('nope', 'form');
      await vi.advanceTimersByTimeAsync(GRADE_DELAY_MS);
      expect(await result).toMatchObject({ correct: false });
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const submitForm = (): void => {
      const formEl = host.querySelector<HTMLFormElement>('form');
      if (!formEl) throw new Error('no form rendered');
      formEl.requestSubmit();
    };

    const typeAnswer = (value: string): void => {
      const input = host.querySelector<HTMLInputElement>('input');
      if (!input) throw new Error('no text input rendered');
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };

    const gradeAndSettle = async (): Promise<void> => {
      await vi.advanceTimersByTimeAsync(GRADE_DELAY_MS);
      await fixture.whenStable();
      await Promise.resolve();
      await fixture.whenStable();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => vi.useRealTimers());

    it('renders the first card and the counter', () => {
      expect(host.textContent).toContain('builds a form');
      expect(host.textContent).toContain('Question 1 / 2');
      expect(host.querySelector('input')).toBeTruthy();
    });

    it('blocks submit and reports the required error when empty (onInvalid)', async () => {
      submitForm();
      await gradeAndSettle();

      expect(host.textContent).toContain(
        'Answer this question before submitting.',
      );
      expect(host.textContent).toContain('Question 1 / 2');
    });

    it('advances to the next card on a correct answer', async () => {
      typeAnswer('form');
      submitForm();
      await gradeAndSettle();

      expect(host.textContent).toContain('Question 2 / 2');
      expect(host.textContent).toContain('while the submit action runs');
    });

    it('shows the field error, shakes, and stays on the card for a wrong answer', async () => {
      typeAnswer('schema');
      submitForm();
      await gradeAndSettle();

      expect(host.textContent).toContain('Not quite, try again.');
      expect(host.textContent).toContain('Question 1 / 2');
      expect(host.querySelector('.card')?.classList).toContain('card--shake');
    });
  });
});
