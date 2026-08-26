import { Component, computed, signal } from '@angular/core';
import { FieldTree, form } from '@angular/forms/signals';
import { ENGAGEMENTS, INITIAL_APPLICATION, ROLES } from './app.data';
import {
  Application,
  ContractEngagement,
  DesignerApplication,
  Engagement,
  EngagementKind,
  RoleId,
} from './app.model';
import { applicationSchema } from './app.schema';
import {
  createEngagement,
  skillsForRole,
  switchApplicationRole,
} from './app.utils';
import {
  NbButton,
  NbButtonTrailingIcon,
  NbCallout,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbSeparator,
  NbText,
  type NbToneToken,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerCopyright } from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';
import { FrontendForm } from './frontend-form';
import { DesignerForm } from './designer-form';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [
    NbButton,
    NbButtonTrailingIcon,
    NbCallout,
    NbChipGroup,
    NbCluster,
    NbChip,
    NbSeparator,
    NbText,
    NgIcon,
    FrontendForm,
    DesignerForm,
  ],
  viewProviders: [
    provideIcons({
      tablerCircleArrowLeftFill,
      tablerCircleArrowRightFill,
      tablerCopyright,
    }),
  ],
  host: {
    class: 'relative mx-auto flex w-2xl max-w-full shrink-0 flex-col gap-4',
  },
})
export class App {
  protected readonly roles = ROLES;
  protected readonly engagements = ENGAGEMENTS;

  protected readonly applicationModel = signal<Application>({
    ...INITIAL_APPLICATION,
  });

  protected readonly applicationForm = form(
    this.applicationModel,
    applicationSchema,
    {
      submission: {
        action: async () => undefined,
        onInvalid: (field) =>
          field().errorSummary()[0]?.fieldTree().focusBoundControl(),
        ignoreValidators: 'none',
      },
    },
  );

  protected readonly submitting = computed(() =>
    this.applicationForm().submitting(),
  );

  protected readonly selectedRole = computed(() =>
    this.applicationForm.role().value(),
  );

  protected readonly selectedEngagement = computed(
    () => this.applicationForm.engagement().value().kind,
  );

  protected readonly currentRole = computed(
    () =>
      this.roles.find((role) => role.id === this.selectedRole()) ??
      this.roles[0],
  );

  protected readonly roleTabs = computed(() => {
    const selected = this.selectedRole();

    return this.roles.map((role) => {
      const selectedTab = role.id === selected;
      const tone: NbToneToken = selectedTab ? role.selectedTone : 'background';

      return { ...role, selected: selectedTab, tone };
    });
  });

  protected readonly isDesigner = computed(
    () => this.selectedRole() === 'designer',
  );

  protected readonly isContract = computed(
    () => this.selectedEngagement() === 'contract',
  );

  protected selectRole(role: RoleId): void {
    if (this.applicationModel().role === role) return;

    this.applicationModel.update((from) =>
      switchApplicationRole(from, role, skillsForRole(role)),
    );
  }

  protected selectEngagement(kind: EngagementKind): void {
    if (this.applicationModel().engagement.kind === kind) return;

    this.applicationForm.engagement().value.set(createEngagement(kind));
  }

  protected addSkill(raw: string): void {
    const skill = raw.trim();

    this.applicationForm
      .skills()
      .value.update((skills) =>
        skills.some((item) => item.toLowerCase() === skill.toLowerCase())
          ? skills
          : [...skills, skill],
      );
  }

  protected removeSkill(skill: string): void {
    this.applicationForm
      .skills()
      .value.update((skills) => skills.filter((item) => item !== skill));
  }

  protected reset(): void {
    this.applicationForm().reset({ ...INITIAL_APPLICATION });
  }

  private applicationAs<V extends Application>(): FieldTree<V> {
    return this.applicationForm as unknown as FieldTree<V>;
  }

  private engagementAs<V extends Engagement>(): FieldTree<V> {
    return this.applicationForm.engagement as unknown as FieldTree<V>;
  }

  protected get portfolioField(): FieldTree<string> {
    return this.applicationAs<DesignerApplication>().portfolio;
  }

  protected get dayRateField(): FieldTree<number | null> {
    return this.engagementAs<ContractEngagement>().dayRate;
  }
}
