import { Component, computed, input, output } from '@angular/core';
import { FieldTree, FormField, FormRoot } from '@angular/forms/signals';
import {
  NbButton,
  NbCard,
  NbCardContent,
  NbCardDescription,
  NbCardHeader,
  NbCardTitle,
  NbHalftone,
  NbInput,
  NbInputGroup,
  NbInputPrefix,
  NbInputSuffix,
  NbLabel,
  NbStack,
  NbSticker,
  NbText,
  type NbToneToken,
} from '@ng-brutalism/ui';
import { ENGAGEMENTS, ROLES_BY_ID } from '../app.data';
import {
  Application,
  EngagementKind,
  isContractEngagement,
  isDesignerApplication,
} from '../app.model';
import { createEngagement, variantOf } from '../app.utils';
import { SkillComposer } from '../skill-composer/skill-composer';
import { SubmittedBanner } from '../submitted-banner/submitted-banner';
import { ValidationErrors } from '../validation-errors';

@Component({
  selector: 'app-designer-form',
  templateUrl: './designer-form.html',
  styleUrl: './designer-form.css',
  imports: [
    FormRoot,
    FormField,
    NbButton,
    NbCard,
    NbCardHeader,
    NbCardTitle,
    NbCardDescription,
    NbCardContent,
    NbHalftone,
    NbInput,
    NbInputGroup,
    NbInputPrefix,
    NbInputSuffix,
    NbLabel,
    NbStack,
    NbSticker,
    NbText,
    SkillComposer,
    SubmittedBanner,
    ValidationErrors,
  ],
  host: {
    class: 'block w-full',
  },
})
export class DesignerForm {
  readonly form = input.required<FieldTree<Application>>();
  readonly submitting = input(false);
  readonly submitted = input(false);
  readonly retry = output();

  protected readonly engagements = ENGAGEMENTS;

  protected readonly skillPlaceholder = ROLES_BY_ID.designer.placeholder;

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
      const tone: NbToneToken = selectedTab
        ? ROLES_BY_ID.designer.selectedTone
        : 'background';

      return { ...engagement, selected: selectedTab, tone };
    });
  });

  protected selectEngagement(kind: EngagementKind): void {
    if (this.form().engagement().value().kind === kind) return;

    this.form().engagement().value.set(createEngagement(kind));
  }

  protected get portfolioField(): FieldTree<string> {
    return variantOf(this.form(), isDesignerApplication, 'designer').portfolio;
  }

  protected get dayRateField(): FieldTree<number | null> {
    return variantOf(this.form().engagement, isContractEngagement, 'contract')
      .dayRate;
  }
}
