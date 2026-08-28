import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  apply,
  debounce,
  form,
  required,
  type FieldTree,
} from '@angular/forms/signals';
import { INITIAL_APPLICATION } from '../app.data';
import { Application } from '../app.model';
import { applicationSchema, skillItemSchema } from '../app.schema';
import { SkillComposer } from './skill-composer';

type ErrorReader = () => {
  errors(): ReadonlyArray<{ kind: string; message?: string }>;
};

const messagesOf = (field: ErrorReader): ReadonlyArray<string | undefined> =>
  field()
    .errors()
    .map((error) => error.message);

const kindsOf = (field: ErrorReader): ReadonlyArray<string> =>
  field()
    .errors()
    .map((error) => error.kind);

const buildSkillDraftForm = (initial = ''): FieldTree<string> => {
  const model = signal(initial);

  return form(
    model,
    (path) => {
      required(path, { message: 'A skill is required.' });
      apply(path, skillItemSchema);
      debounce(path, 500);
    },
    {
      injector: TestBed.inject(Injector),
    },
  );
};

const buildSkillsField = (
  skills: string[] = [...INITIAL_APPLICATION.skills],
): FieldTree<string[]> => {
  const model = signal<Application>({ ...INITIAL_APPLICATION, skills });

  return form(model, applicationSchema, {
    injector: TestBed.inject(Injector),
  }).skills;
};

describe('SkillComposer (10 · Dynamic Forms)', () => {
  describe('draft form (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('is required', () => {
      const skillDraftForm = buildSkillDraftForm();

      expect(skillDraftForm().valid()).toBe(false);
      expect(kindsOf(skillDraftForm)).toContain('required');
      expect(messagesOf(skillDraftForm)).toContain('A skill is required.');
    });

    it('rejects a skill that is not letters-only', () => {
      const skillDraftForm = buildSkillDraftForm('C++');

      expect(skillDraftForm().valid()).toBe(false);
      expect(kindsOf(skillDraftForm)).toContain('pattern');
      expect(messagesOf(skillDraftForm)).toContain(
        'Letters only. No numbers or special characters.',
      );
    });

    it('accepts a letters-only skill', () => {
      const skillDraftForm = buildSkillDraftForm('Signals');

      expect(skillDraftForm().valid()).toBe(true);
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<SkillComposer>;
    let host: HTMLElement;
    let skillsField: FieldTree<string[]>;

    const skillInput = (): HTMLInputElement =>
      host.querySelector('#frontend-skill') as HTMLInputElement;

    const addButton = (): HTMLButtonElement =>
      Array.from(host.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('Add'),
      ) as HTMLButtonElement;

    const typeSkill = async (value: string): Promise<void> => {
      const input = skillInput();
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    };

    const settleDebounce = async (): Promise<void> => {
      await vi.advanceTimersByTimeAsync(500);
      await fixture.whenStable();
    };

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [SkillComposer] });
      fixture = TestBed.createComponent(SkillComposer);
      host = fixture.nativeElement as HTMLElement;
      skillsField = buildSkillsField(['Angular', 'TypeScript']);

      fixture.componentRef.setInput('skills', skillsField);
      fixture.componentRef.setInput('inputId', 'frontend-skill');
      fixture.componentRef.setInput('placeholder', 'e.g. Signals');
      fixture.componentRef.setInput('tone', 'success');
      fixture.componentRef.setInput(
        'draftErrorsId',
        'frontend-skill-draft-errors',
      );
      fixture.componentRef.setInput('skillsErrorsId', 'frontend-skills-errors');

      await fixture.whenStable();
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => vi.useRealTimers());

    it('renders chips from the initial skills', () => {
      expect(host.textContent).toContain('Angular');
      expect(host.textContent).toContain('TypeScript');
    });

    it('keeps Add disabled for an invalid draft after debounce settles', async () => {
      await typeSkill('C++');
      await settleDebounce();

      expect(addButton().disabled).toBe(true);
    });

    it('adds a valid skill to the model and clears the draft', async () => {
      await typeSkill('Signals');
      await settleDebounce();

      addButton().click();
      await fixture.whenStable();

      expect(skillsField().value()).toEqual([
        'Angular',
        'TypeScript',
        'Signals',
      ]);
      expect(skillInput().value).toBe('');
      expect(host.textContent).toContain('Signals');
    });

    it('ignores a duplicate skill (case-insensitive) and clears the draft', async () => {
      await typeSkill('angular');
      await settleDebounce();

      addButton().click();
      await fixture.whenStable();

      expect(skillsField().value()).toEqual(['Angular', 'TypeScript']);
      expect(skillInput().value).toBe('');
    });

    it('removes a skill when its chip remove control is clicked', async () => {
      const removeAngular = host.querySelector(
        'button[aria-label="Remove Angular"]',
      ) as HTMLButtonElement;

      removeAngular.click();
      await fixture.whenStable();

      expect(skillsField().value()).toEqual(['TypeScript']);
      expect(host.textContent).not.toContain('Angular');
    });

    it('adds a skill when Enter is pressed on a settled valid draft', async () => {
      await typeSkill('RxJS');
      await settleDebounce();

      skillInput().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      await fixture.whenStable();

      expect(skillsField().value()).toEqual(['Angular', 'TypeScript', 'RxJS']);
    });

    it('does not flash the skill required error while debounce is in flight', async () => {
      await typeSkill('Signals');

      expect(host.textContent).not.toContain('A skill is required.');

      await settleDebounce();

      expect(host.textContent).not.toContain('A skill is required.');
    });
  });
});
