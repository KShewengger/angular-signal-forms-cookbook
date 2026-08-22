import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import { INITIAL_ANSWER, QuizAnswer } from './app.model';
import { answerSchema } from './app.schema';
import { GRADER_LATENCY_MS, GraderService } from './grader.service';

const buildAnswerForm = (value = ''): FieldTree<QuizAnswer> => {
  const model = signal<QuizAnswer>({ ...INITIAL_ANSWER, answer: value });
  return form(model, answerSchema, { injector: TestBed.inject(Injector) });
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
      TestBed.configureTestingModule({
        providers: [{ provide: GRADER_LATENCY_MS, useValue: 0 }],
      });
      grader = TestBed.inject(GraderService);
    });

    it('accepts the right answer, case-insensitively and trimmed', async () => {
      expect(await grader.grade('q1', '  Form ')).toBe(true);
      expect(await grader.grade('q2', 'submitting')).toBe(true);
    });

    it('rejects a wrong answer', async () => {
      expect(await grader.grade('q1', 'schema')).toBe(false);
    });

    it('rejects an unknown question', async () => {
      expect(await grader.grade('nope', 'form')).toBe(false);
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

    const settle = async (): Promise<void> => {
      await fixture.whenStable();
      await Promise.resolve();
      await fixture.whenStable();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
        providers: [{ provide: GRADER_LATENCY_MS, useValue: 0 }],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('renders the first card and the counter', () => {
      expect(host.textContent).toContain('builds a form');
      expect(host.textContent).toContain('Question 1 / 2');
      expect(host.querySelector('input')).toBeTruthy();
    });

    it('blocks submit and reports the required error when empty (onInvalid)', async () => {
      submitForm();
      await settle();

      expect(host.textContent).toContain(
        'Answer this question before submitting.',
      );
      expect(host.textContent).toContain('Question 1 / 2');
    });

    it('advances to the next card on a correct answer', async () => {
      typeAnswer('form');
      submitForm();
      await settle();

      expect(host.textContent).toContain('Question 2 / 2');
      expect(host.textContent).toContain('while the submit action runs');
    });

    it('shows the field error and stays on the card for a wrong answer', async () => {
      typeAnswer('schema');
      submitForm();
      await settle();

      expect(host.textContent).toContain('Not quite, try again.');
      expect(host.textContent).toContain('Question 1 / 2');
    });

    it('locks the deck with a form-level error after three wrong tries', async () => {
      const wrongTries = ['alpha', 'beta', 'gamma'];
      for (const wrong of wrongTries) {
        typeAnswer(wrong);
        submitForm();
        await settle();
      }

      expect(host.textContent).toContain('Out of tries');
      expect(host.textContent).toContain('Out of tries, the deck is locked.');
    });
  });
});
