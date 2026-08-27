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
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerX } from '@ng-icons/tabler-icons';
import { ENGAGEMENTS, ROLES } from '../app.data';
import {
  Application,
  ContractEngagement,
  DesignerApplication,
  Engagement,
  EngagementKind,
} from '../app.model';
import { SKILL_PATTERN } from '../app.schema';
import { createEngagement } from '../app.utils';
import { ValidationErrors } from '../validation-errors';

@Component({
  selector: 'app-designer-form',
  templateUrl: './designer-form.html',
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
    NgIcon,
    ValidationErrors,
  ],
  viewProviders: [provideIcons({ tablerX })],
  host: {
    class: 'block w-full',
  },
})
export class DesignerForm {
  readonly form = input.required<FieldTree<Application>>();
  readonly submitting = input(false);

  protected readonly engagements = ENGAGEMENTS;

  protected readonly skillPlaceholder =
    ROLES.find((role) => role.id === 'designer')?.placeholder ?? '';

  protected readonly skill = signal('');

  protected readonly canAddSkill = computed(() => {
    const skill = this.skill().trim();
    return skill.length > 0 && SKILL_PATTERN.test(skill);
  });

  protected readonly canSubmit = computed(
    () => !this.submitting() && this.form()().valid(),
  );

  protected readonly nameInvalid = computed(() => {
    const field = this.form().name();
    return field.touched() && field.invalid();
  });

  protected readonly yearsInvalid = computed(() => {
    const field = this.form().years();
    return field.touched() && field.invalid();
  });

  protected readonly portfolioInvalid = computed(() => {
    const field = this.portfolioField();
    return field.touched() && field.invalid();
  });

  protected readonly dayRateInvalid = computed(() => {
    const field = this.dayRateField();
    return field.touched() && field.invalid();
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
      const tone: NbToneToken = selectedTab ? 'pink' : 'background';

      return { ...engagement, selected: selectedTab, tone };
    });
  });

  protected selectEngagement(kind: EngagementKind): void {
    if (this.form().engagement().value().kind === kind) return;

    this.form().engagement().value.set(createEngagement(kind));
  }

  protected setSkill(event: Event): void {
    this.skill.set((event.target as HTMLInputElement).value);
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

  protected addSkillFromEnter(event: Event): void {
    event.preventDefault();
    this.addSkill();
  }

  protected removeSkill(skill: string): void {
    this.form()
      .skills()
      .value.update((skills) => skills.filter((item) => item !== skill));
  }

  private applicationAs<V extends Application>(): FieldTree<V> {
    return this.form() as unknown as FieldTree<V>;
  }

  private engagementAs<V extends Engagement>(): FieldTree<V> {
    return this.form().engagement as unknown as FieldTree<V>;
  }

  protected get portfolioField(): FieldTree<string> {
    return this.applicationAs<DesignerApplication>().portfolio;
  }

  protected get dayRateField(): FieldTree<number | null> {
    return this.engagementAs<ContractEngagement>().dayRate;
  }
}
