import { Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {
  form,
  FormField,
  required,
  schema,
  validate,
  email,
  apply,
  debounce,
} from '@angular/forms/signals';
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
import { UserFormModel } from './app.model';
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
  providers: [
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
  private userModel = signal<UserFormModel>({
    email: '',
    confirmEmail: '',
  });

  private emailSchema = schema<string>((path) => {
    required(path, {
      message: 'Please enter your email.',
    });
    email(path, {
      message: 'Please enter a valid email address',
    });
    debounce(path, 250);
  });

  protected userForm = form(this.userModel, (path) => {
    apply(path.email, this.emailSchema);

    apply(path.confirmEmail, this.emailSchema);

    validate(path.confirmEmail, ({ value, valueOf }) => {
      const email = valueOf(path.email);

      if (!email || !value()) return null;

      if (email.trim().toLowerCase() !== value().trim().toLowerCase()) {
        return {
          kind: 'emailMismatch',
          message: 'Email addresses do not match.',
        };
      }

      return null;
    });
  });

  protected value = computed(() => this.userForm().value());
  protected valid = computed(
    () => this.userForm().dirty() && this.userForm().valid(),
  );

  protected clear() {
    this.userForm().reset({
      email: '',
      confirmEmail: '',
    });
  }
}
