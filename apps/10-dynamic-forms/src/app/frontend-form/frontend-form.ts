import { Component, computed, input, signal } from '@angular/core';
import { FieldTree, FormField, FormRoot } from '@angular/forms/signals';
import {
  NbButton,
  NbCard,
  NbCardContent,
  NbCardDescription,
  NbCardHeader,
  NbCardTitle,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbHalftone,
  NbInput,
  NbInputGroup,
  NbInputPrefix,
  NbInputSuffix,
  NbLabel,
  NbStack,
  NbSticker,
  NbSurface,
  NbText,
  type NbToneToken,
} from '@ng-brutalism/ui';
import { ENGAGEMENTS, ROLES } from '../app.data';
import {
  Application,
  ContractEngagement,
  Engagement,
  EngagementKind,
} from '../app.model';
import { SKILL_PATTERN } from '../app.schema';
import { createEngagement } from '../app.utils';
import { ValidationErrors } from '../validation-errors';

@Component({
  selector: 'app-frontend-form',
  templateUrl: './frontend-form.html',
  imports: [
    FormRoot,
    FormField,
    NbButton,
    NbCard,
    NbCardHeader,
    NbCardTitle,
    NbCardDescription,
    NbCardContent,
    NbChip,
    NbChipGroup,
    NbCluster,
    NbHalftone,
    NbInput,
    NbInputGroup,
    NbInputPrefix,
    NbInputSuffix,
    NbLabel,
    NbStack,
    NbSticker,
    NbSurface,
    NbText,
    ValidationErrors,
  ],
  host: {
    class: 'block w-full',
  },
})
export class FrontendForm {
  readonly form = input.required<FieldTree<Application>>();
  readonly submitting = input(false);

  protected readonly engagements = ENGAGEMENTS;

  protected readonly skillPlaceholder =
    ROLES.find((role) => role.id === 'frontend')?.placeholder ?? '';

  protected readonly skill = signal('');

  protected readonly canAddSkill = computed(() => {
    const skill = this.skill().trim();
    return skill.length > 0 && SKILL_PATTERN.test(skill);
  });

  protected readonly selectedEngagement = computed(
    () => this.form().engagement().value().kind,
  );

  protected readonly isContract = computed(
    () => this.selectedEngagement() === 'contract',
  );

  protected readonly engagementTabs = computed(() => {
    const selected = this.selectedEngagement();

    return this.engagements.map((engagement) => {
      const selectedTab = engagement.kind === selected;
      const tone: NbToneToken = selectedTab ? 'success' : 'background';

      return { ...engagement, selected: selectedTab, tone };
    });
  });

  protected selectEngagement(kind: EngagementKind): void {
    if (this.form().engagement().value().kind === kind) return;

    this.form().engagement().value.set(createEngagement(kind));
  }

  protected addSkill(): void {
    if (!this.canAddSkill()) return;

    const skill = this.skill().trim();

    this.form()
      .skills()
      .value.update((skills) =>
        skills.some((item) => item.toLowerCase() === skill.toLowerCase())
          ? skills
          : [...skills, skill],
      );

    this.skill.set('');
  }

  protected onSkillInput(event: Event): void {
    this.skill.set((event.target as HTMLInputElement).value);
  }

  protected onSkillEnter(event: Event): void {
    event.preventDefault();
    this.addSkill();
  }

  protected removeSkill(skill: string): void {
    this.form()
      .skills()
      .value.update((skills) => skills.filter((item) => item !== skill));
  }

  private engagementAs<V extends Engagement>(): FieldTree<V> {
    return this.form().engagement as unknown as FieldTree<V>;
  }

  protected get dayRateField(): FieldTree<number | null> {
    return this.engagementAs<ContractEngagement>().dayRate;
  }
}
