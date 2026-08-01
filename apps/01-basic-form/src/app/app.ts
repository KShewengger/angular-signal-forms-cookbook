import { Component, computed, signal, viewChild } from '@angular/core';
import { KeyValuePipe, NgOptimizedImage } from '@angular/common';
import { form, FormField, required } from '@angular/forms/signals';
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
} from '@ng-brutalism/ui';
import { RegistrationFormModel } from './app.model';
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
  ],
  providers: [
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
  private dialog = viewChild.required<NbDialog>('dialog');

  private userModel = signal<RegistrationFormModel>({
    name: '',
    age: null,
    role: null,
    bio: '',
    beginner: false,
  });

  protected userForm = form(this.userModel, (path) => {
    required(path.name);
  });

  protected value = computed(() => this.userForm().value());

  protected clear() {
    this.dialog().close();
    this.userForm().reset({
      name: '',
      age: null,
      role: null,
      bio: '',
      beginner: false,
    });
  }
}
