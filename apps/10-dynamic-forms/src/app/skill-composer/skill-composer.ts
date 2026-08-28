import { Component, computed, input, signal } from '@angular/core';
import {
  apply,
  debounce,
  FieldTree,
  FormField,
  form,
  required,
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
import { IsFieldInvalidPipe } from '../is-field-invalid';
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
    IsFieldInvalidPipe,
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
    required(path, { message: 'A skill is required.' });
    apply(path, skillItemSchema);
    debounce(path, 500);
  });

  protected readonly draftSettled = computed(() => {
    const field = this.skillForm();

    return field.controlValue() === field.value();
  });

  protected readonly canAddSkill = computed(() => {
    const field = this.skillForm();

    return this.draftSettled() && field.valid();
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
    const skills = skillsField().value();

    if (
      skills.some((existing) => existing.toLowerCase() === skill.toLowerCase())
    ) {
      this.skillForm().reset('');
      return;
    }

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
