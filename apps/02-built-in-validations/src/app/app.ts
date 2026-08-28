import { Component, computed, signal, viewChild } from '@angular/core';
import { KeyValuePipe, NgOptimizedImage } from '@angular/common';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import {
  NbCard,
  NbCardHeader,
  NbCardTitle,
  NbCardActions,
  NbCardContent,
  NbButton,
  NbInput,
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
  NbHalftone,
  NbMediaFrame,
  NbStack,
  NbCluster,
  NbLabel,
  NbCheckbox,
  NbButtonTrailingIcon,
} from '@ng-brutalism/ui';
import { INITIAL_REGISTRATION, RegistrationFormModel } from './app.model';
import { registrationSchema } from './app.schema';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerUserCheck, tablerCopyright } from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowRightFill,
  tablerCircleArrowLeftFill,
} from '@ng-icons/tabler-icons/fill';
import { fieldTouchedInvalid, keepOrder } from './app.utils';
import { ValidationErrors } from './validation-errors';
import { ROLES } from './app.data';

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
    NbCluster,
    NbCardActions,
    NbCardContent,
    NbInput,
    NbDisplay,
    NbSelect,
    NbSelectOption,
    NbTextarea,
    NbChip,
    NbChipGroup,
    NbSticker,
    NbSeparator,
    NbStack,
    FormField,
    FormRoot,
    NbDialogClose,
    NbDialogContent,
    NbIconButton,
    NbCallout,
    NbTitle,
    NgIcon,
    NbText,
    NbHalftone,
    KeyValuePipe,
    NbMediaFrame,
    NbLabel,
    NbCheckbox,
    NbButtonTrailingIcon,
    ValidationErrors,
  ],
  viewProviders: [
    provideIcons({
      tablerUserCheck,
      tablerCopyright,
      tablerCircleArrowRightFill,
      tablerCircleArrowLeftFill,
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

  protected readonly userForm = form(this.userModel, registrationSchema, {
    submission: {
      action: async () => {
        this.dialog().open();
      },
    },
  });

  protected readonly value = computed(() => this.userForm().value());

  protected readonly formDirty = computed(() => this.userForm().dirty());

  protected readonly canSave = computed(
    () => this.userForm().dirty() && !this.userForm().invalid(),
  );

  protected readonly ariaInvalid = computed(() => ({
    username: fieldTouchedInvalid(this.userForm.username()),
    email: fieldTouchedInvalid(this.userForm.email()),
    age: fieldTouchedInvalid(this.userForm.age()),
    role: fieldTouchedInvalid(this.userForm.role()),
    bio: fieldTouchedInvalid(this.userForm.bio()),
  }));

  protected readonly roles = ROLES;
  protected readonly keepOrder = keepOrder;

  protected clear(): void {
    this.dialog().close();
    this.userForm().reset({ ...INITIAL_REGISTRATION });
  }
}
