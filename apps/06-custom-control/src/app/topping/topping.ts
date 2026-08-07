import { Component, input, model, output } from '@angular/core';
import {
  FormValueControl,
  ValidationError,
  WithOptionalFieldTree,
} from '@angular/forms/signals';
import {
  NbInput,
  NbInputGroup,
  NbInputPrefix,
  NbStack,
  NbInputSuffix,
  NbIconButton,
} from '@ng-brutalism/ui';
import { ValidationErrors } from '../validation-errors';
import { NgOptimizedImage } from '@angular/common';
import { PizzaTopping } from '../app.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerChevronDown, tablerChevronUp } from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-topping',
  templateUrl: 'topping.html',
  styleUrl: 'topping.css',
  imports: [
    NgIcon,
    NbIconButton,
    NbInput,
    NbInputGroup,
    NbStack,
    NbInputSuffix,
    NbInputPrefix,
    NgOptimizedImage,
    ValidationErrors,
  ],
  providers: [
    provideIcons({
      tablerChevronUp,
      tablerChevronDown,
    }),
  ],
  host: {
    '[class.hidden]': 'hidden()',
  },
})
export class Topping implements FormValueControl<number | undefined> {
  readonly topping = input.required<PizzaTopping>();

  readonly value = model<number>();
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>(
    [],
  );

  readonly touched = input(false);
  readonly touch = output<void>();

  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly hidden = input<boolean>(false);

  protected update(input: HTMLInputElement) {
    this.value.set(input.value === '' ? 0 : input.valueAsNumber);
  }

  protected increment() {
    this.value.update((num) => (num ?? 0) + 1);
  }

  protected decrement() {
    this.value.update((num) => (num ?? 0) - 1);
  }
}
