import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, required, type FieldTree } from '@angular/forms/signals';
import { INITIAL_ANSWER, QuizAnswer } from '../app.model';
import { ValidationErrors } from './validation-errors';

describe('ValidationErrors (09 · Form Submission)', () => {
  let fixture: ComponentFixture<ValidationErrors>;
  let host: HTMLElement;

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

  const showErrorsFor = async (
    answerForm: FieldTree<QuizAnswer>,
  ): Promise<void> => {
    fixture.componentRef.setInput('field', answerForm.answer);

    await fixture.whenStable();
  };

  const errorList = (): HTMLUListElement | null => host.querySelector('ul');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ValidationErrors] });
    fixture = TestBed.createComponent(ValidationErrors);
    host = fixture.nativeElement as HTMLElement;
  });

  describe('visibility', () => {
    it('renders nothing while the field is pristine and untouched', async () => {
      await showErrorsFor(buildAnswerForm(''));

      expect(errorList()).toBeNull();
    });

    it('renders nothing for a valid answer, even after it is touched', async () => {
      const answerForm = buildAnswerForm('form');

      answerForm.answer().markAsTouched();
      await showErrorsFor(answerForm);

      expect(errorList()).toBeNull();
    });

    it('shows the error once an empty answer is touched', async () => {
      const answerForm = buildAnswerForm('');

      answerForm.answer().markAsTouched();
      await showErrorsFor(answerForm);

      expect(errorList()).not.toBeNull();
    });

    it('shows the error once an empty answer is dirty', async () => {
      const answerForm = buildAnswerForm('');

      answerForm.answer().markAsDirty();
      await showErrorsFor(answerForm);

      expect(errorList()).not.toBeNull();
    });
  });

  describe('rendering the real recipe error', () => {
    it('surfaces the required message (via errorSummary)', async () => {
      const answerForm = buildAnswerForm('');

      answerForm.answer().markAsTouched();
      await showErrorsFor(answerForm);

      expect(host.textContent).toContain(
        'Answer this question before submitting.',
      );
    });

    it('renders a flat list for a single error', async () => {
      const answerForm = buildAnswerForm('');

      answerForm.answer().markAsTouched();
      await showErrorsFor(answerForm);

      const list = errorList();

      expect(list?.classList.contains('list-disc')).toBe(false);
      expect(host.querySelectorAll('li').length).toBe(1);
    });
  });

  describe('accessibility', () => {
    it('exposes the error to assistive technology', async () => {
      const answerForm = buildAnswerForm('');

      answerForm.answer().markAsTouched();
      await showErrorsFor(answerForm);

      const list = errorList();

      expect(list?.getAttribute('role')).toBe('alert');
      expect(list?.getAttribute('aria-live')).toBe('polite');
    });
  });
});
