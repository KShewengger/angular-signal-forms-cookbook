import { Component, computed, input, signal } from '@angular/core';
import {
  apply,
  debounce,
  FieldTree,
  FormField,
  form,
  validate,
} from '@angular/forms/signals';
import {
  NbButton,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbInput,
  NbLabel,
  NbStack,
  NbSurface,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerX } from '@ng-icons/tabler-icons';
import { skillItemSchema } from '../app.schema';
import { ValidationErrors } from '../validation-errors';

@Component({
  selector: 'app-skill-composer',
  templateUrl: './skill-composer.html',
  imports: [
    FormField,
    NbButton,
    NbChip,
    NbChipGroup,
    NbCluster,
    NbInput,
    NbLabel,
    NbStack,
    NbSurface,
    NgIcon,
    ValidationErrors,
  ],
  viewProviders: [provideIcons({ tablerX })],
  host: {
    class: 'block w-full',
  },
})
export class SkillComposer {
  readonly skills = input.required<FieldTree<string[]>>();
  readonly inputId = input.required<string>();
  readonly placeholder = input.required<string>();
  readonly tone = input.required<'success' | 'pink'>();
  readonly draftErrorsId = input.required<string>();
  readonly skillsErrorsId = input.required<string>();

  private readonly skillDraft = signal('');

  protected readonly skillForm = form(this.skillDraft, (path) => {
    apply(path, skillItemSchema);
    validate(path, ({ value }) => {
      const skill = value().trim();
      if (!skill) return null;

      const exists = this.skills()()
        .value()
        .some((existing) => existing.toLowerCase() === skill.toLowerCase());

      return exists
        ? { kind: 'duplicateSkill', message: 'Skill already exists' }
        : null;
    });
    debounce(path, 300);
  });

  protected readonly draftSettled = computed(() => {
    const field = this.skillForm();

    return field.controlValue() === field.value();
  });

  protected readonly skillInvalid = computed(() => {
    if (!this.draftSettled()) return false;

    const field = this.skillForm();

    return (field.dirty() || field.touched()) && field.invalid();
  });

  protected readonly canAddSkill = computed(() => {
    const field = this.skillForm();
    const trimmed = field.value().trim();

    return this.draftSettled() && field.valid() && trimmed.length > 0;
  });

  protected readonly skillChips = computed(() => {
    const skillsField = this.skills();

    return skillsField()
      .value()
      .map((name) => ({
        name,
        removeLabel: $localize`:@@removeSkillLabel:Remove ${name}:skill:`,
      }));
  });

  protected addSkill(): void {
    this.skillForm().markAsTouched();
    if (!this.canAddSkill()) return;

    const skill = this.skillForm().value().trim();
    const skillsField = this.skills();

    skillsField().value.update((current) => [...current, skill]);
    this.skillForm().reset('');
    skillsField[skillsField.length - 1]().markAsTouched();
  }

  protected addSkillFromEnter(event: Event): void {
    event.preventDefault();
    this.addSkill();
  }

  protected removeSkill(skill: string): void {
    const skillsField = this.skills();

    skillsField().value.update((skills) =>
      skills.filter((existing) => existing !== skill),
    );
  }
}
