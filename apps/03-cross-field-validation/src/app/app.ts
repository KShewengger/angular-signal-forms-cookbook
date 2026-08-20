import { Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';
import {
  NbCard,
  NbCardHeader,
  NbCardTitle,
  NbInput,
  NbDisplay,
  NbChip,
  NbChipGroup,
  NbSticker,
  NbInputGroup,
  NbInputPrefix,
  NbSeparator,
  NbCluster,
  NbCallout,
  NbMediaFrame,
  NbStack,
  NbInputSuffix,
  NbHalftone,
  NbSplit,
  NbText,
  NbButtonTrailingIcon,
  NbButton,
  NbLabel,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  tablerCopyright,
  tablerArrowRight,
  tablerUserX,
  tablerUserCheck,
  tablerCheck,
} from '@ng-icons/tabler-icons';
import { INITIAL_USER, UserFormModel } from './app.model';
import { userSchema } from './app.schema';
import { ValidationErrors } from './validation-errors';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    NgOptimizedImage,
    NbSplit,
    NbChip,
    NbChipGroup,
    NbCard,
    NbInputGroup,
    NbInputPrefix,
    NbInputSuffix,
    NbCluster,
    NbCardHeader,
    NbCardTitle,
    NbInput,
    NbStack,
    NbDisplay,
    NbHalftone,
    NbSticker,
    NbSeparator,
    FormField,
    NbCallout,
    NgIcon,
    NbMediaFrame,
    ValidationErrors,
    NbText,
    NbButtonTrailingIcon,
    NbButton,
    NbLabel,
  ],
  viewProviders: [
    provideIcons({
      tablerCopyright,
      tablerArrowRight,
      tablerUserX,
      tablerUserCheck,
      tablerCheck,
      tablerCircleArrowLeftFill,
      tablerCircleArrowRightFill,
    }),
  ],
  host: {
    class: 'relative flex flex-col gap-6 mx-auto w-3xl shrink-0',
  },
})
export class App {
  private readonly userModel = signal<UserFormModel>({ ...INITIAL_USER });

  protected readonly userForm = form(this.userModel, userSchema);

  protected readonly value = computed(() => this.userForm().value());

  protected readonly valid = computed(
    () => this.userForm().dirty() && this.userForm().valid(),
  );

  protected clear(): void {
    this.userForm().reset({ ...INITIAL_USER });
  }
}
