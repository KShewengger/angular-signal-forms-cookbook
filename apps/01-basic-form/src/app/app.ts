import { Component, computed, signal, viewChild } from '@angular/core';
import { KeyValuePipe, NgOptimizedImage } from '@angular/common';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import {
  NbCard,
  NbCardHeader,
  NbCardTitle,
  NbCardActions,
  NbCardContent,
  NbButton,
  NbInput,
  NbStatusDot,
  NbDisplay,
  NbSelect,
  NbSelectOption,
  NbTextarea,
  NbChip,
  NbChipGroup,
  NbSticker,
  NbSeparator,
  NbDialog,
  NbDialogClose,
  NbDialogContent,
  NbIconButton,
  NbTitle,
  NbText,
  NbCallout,
  NbCluster,
  NbMediaFrame,
  NbStack,
  NbLabel,
  NbCheckbox,
  NbButtonTrailingIcon,
} from '@ng-brutalism/ui';
import { INITIAL_REGISTRATION, RegistrationFormModel } from './app.model';
import { ROLES } from './app.data';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerUserCheck, tablerCopyright } from '@ng-icons/tabler-icons';
import { tablerCircleArrowRightFill } from '@ng-icons/tabler-icons/fill';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    NgOptimizedImage,
    NbDialog,
    NbButton,
    NbCard,
    NbCardHeader,
    NbCardTitle,
    NbCardActions,
    NbCardContent,
    NbInput,
    NbStack,
    NbDisplay,
    NbSelect,
    NbSelectOption,
    NbTextarea,
    NbChip,
    NbChipGroup,
    NbSticker,
    NbSeparator,
    FormField,
    FormRoot,
    NbDialogClose,
    NbDialogContent,
    NbStatusDot,
    NbIconButton,
    NbCluster,
    NbCallout,
    NbTitle,
    NgIcon,
    NbText,
    KeyValuePipe,
    NbMediaFrame,
    NbLabel,
    NbCheckbox,
    NbButtonTrailingIcon,
  ],
  viewProviders: [
    provideIcons({
      tablerUserCheck,
      tablerCopyright,
      tablerCircleArrowRightFill,
    }),
  ],
  host: {
    class: 'relative mx-auto flex w-full max-w-3xl grow flex-col gap-6',
  },
})
export class App {
  private readonly dialog = viewChild.required<NbDialog>('dialog');

  private readonly userModel = signal<RegistrationFormModel>({
    ...INITIAL_REGISTRATION,
  });

  protected readonly userForm = form(
    this.userModel,
    (path) => {
      required(path.name);
    },
    {
      submission: {
        action: async () => {
          this.dialog().open();
        },
      },
    },
  );

  protected readonly value = computed(() => this.userForm().value());

  protected readonly formTouched = computed(() => this.userForm().touched());

  protected readonly formDirty = computed(() => this.userForm().dirty());

  protected readonly formValid = computed(() => this.userForm().valid());

  protected readonly invalidDotLive = computed(
    () => this.userForm().dirty() && this.userForm().invalid(),
  );

  protected readonly canSave = computed(
    () => this.userForm().dirty() && !this.userForm().invalid(),
  );

  protected readonly roles = ROLES;

  protected keepOrder(): number {
    return 0;
  }

  protected clear(): void {
    this.dialog().close();
    this.userForm().reset({ ...INITIAL_REGISTRATION });
  }
}
