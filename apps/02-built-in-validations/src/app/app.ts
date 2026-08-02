import { Component, computed, signal, viewChild } from '@angular/core';
import { KeyValuePipe, NgOptimizedImage } from '@angular/common';
import {
  email,
  form,
  FormField,
  maxLength,
  min,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';
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
import { RegistrationFormModel } from './app.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerUserCheck, tablerCopyright } from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowRightFill,
  tablerCircleArrowLeftFill,
} from '@ng-icons/tabler-icons/fill';
import { ValidationErrors } from './validation-errors';

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
  providers: [
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
  private dialog = viewChild.required<NbDialog>('dialog');

  private userModel = signal<RegistrationFormModel>({
    username: '',
    email: '',
    age: null,
    role: null,
    bio: '',
    beginner: false,
  });

  protected userForm = form(this.userModel, (path) => {
    required(path.username, {
      message: 'Please enter a username.',
    });
    minLength(path.username, 5, {
      message: 'Username must be at least 5 characters long.',
    });
    maxLength(path.username, 20, {
      message: 'Username cannot exceed 20 characters.',
    });
    pattern(path.username, /^USER-\d{3}$/, {
      message: 'Username must follow the format USER-123.',
    });

    required(path.email, {
      message: 'Please enter your email address.',
    });
    email(path.email, {
      message: 'Please enter a valid email address.',
    });

    required(path.age, {
      message: 'Please enter your age.',
    });
    min(path.age, 10, {
      message: 'You must be at least 10 years old.',
    });

    required(path.role, {
      message: 'Please select a role.',
    });

    required(path.bio, {
      message: 'Please enter a short bio.',
    });
    minLength(path.bio, 5, {
      message: 'Bio must be at least 5 characters long.',
    });
  });

  protected value = computed(() => this.userForm().value());

  protected clear() {
    this.dialog().close();
    this.userForm().reset({
      username: '',
      email: '',
      age: null,
      role: null,
      bio: '',
      beginner: false,
    });
  }
}
