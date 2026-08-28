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
  ContractEngagement,
  Engagement,
  EngagementKind,
} from '../app.model';
import { createEngagement } from '../app.utils';
import { IsFieldInvalidPipe } from '../is-field-invalid';
import { SkillComposer } from '../skill-composer/skill-composer';
import { SubmittedBanner } from '../submitted-banner/submitted-banner';
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
    NbHalftone,
    NbInput,
    NbInputGroup,
    NbInputPrefix,
    NbInputSuffix,
    NbLabel,
    NbStack,
    NbSticker,
    NbText,
    IsFieldInvalidPipe,
    SkillComposer,
    SubmittedBanner,
    ValidationErrors,
  ],
  host: {
    class: 'block w-full',
  },
})
export class FrontendForm {
  readonly form = input.required<FieldTree<Application>>();
  readonly submitting = input(false);
  readonly submitted = input(false);
  readonly retry = output();

  protected readonly engagements = ENGAGEMENTS;

  protected readonly skillPlaceholder = ROLES_BY_ID.frontend.placeholder;

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
        ? ROLES_BY_ID.frontend.selectedTone
        : 'background';

      return { ...engagement, selected: selectedTab, tone };
    });
  });

  protected selectEngagement(kind: EngagementKind): void {
    if (this.form().engagement().value().kind === kind) return;

    this.form().engagement().value.set(createEngagement(kind));
  }

  private engagementAs<V extends Engagement>(): FieldTree<V> {
    return this.form().engagement as unknown as FieldTree<V>;
  }

  protected get dayRateField(): FieldTree<number | null> {
    return this.engagementAs<ContractEngagement>().dayRate;
  }
}
