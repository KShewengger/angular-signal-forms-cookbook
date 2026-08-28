import { Component, computed, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { INITIAL_APPLICATION, LESSON_TOPICS, ROLES } from './app.data';
import { Application, RoleId } from './app.model';
import { applicationSchema } from './app.schema';
import { createApplication } from './app.utils';
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
import { FrontendForm } from './frontend-form/frontend-form';
import { DesignerForm } from './designer-form/designer-form';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
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
  protected readonly lessonTopics = LESSON_TOPICS;

  protected readonly applicationModel = signal<Application>({
    ...INITIAL_APPLICATION,
  });

  protected readonly submitted = signal(false);

  protected readonly applicationForm = form(
    this.applicationModel,
    applicationSchema,
    {
      submission: {
        action: async () => {
          const sent = await this.sendApplication();

          this.submitted.set(sent);
        },
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

  protected readonly roleTabs = computed(() => {
    const selected = this.selectedRole();

    return this.roles.map((role) => {
      const selectedTab = role.id === selected;
      const tone: NbToneToken = selectedTab ? role.selectedTone : 'background';

      return { ...role, selected: selectedTab, tone };
    });
  });

  protected selectRole(role: RoleId): void {
    if (this.submitting() || this.selectedRole() === role) return;

    this.resetApplication(role);
  }

  protected retry(): void {
    if (this.submitting()) return;

    this.resetApplication(this.selectedRole());
  }

  private resetApplication(role: RoleId): void {
    this.submitted.set(false);
    this.applicationForm().reset(createApplication(role));
  }

  private sendApplication(): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 500));
  }
}
