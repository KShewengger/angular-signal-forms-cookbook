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
  NbStack,
  NbHalftone,
  NbText,
  NbButton,
  NbButtonTrailingIcon,
} from '@ng-brutalism/ui';
import { PIZZA_TOPPINGS } from './app.data';
import { PizzaFormModel, pizzaMakerSchema } from './app.model';
import { ValidationErrors } from './validation-errors';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [
    NgOptimizedImage,
    NbChip,
    NbChipGroup,
    NbCard,
    NbInputGroup,
    NbInputPrefix,
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
    ValidationErrors,
    NbText,
    NgIcon,
    NbButton,
    NbButtonTrailingIcon,
  ],
  viewProviders: [
    provideIcons({
      tablerCircleArrowRightFill,
      tablerCircleArrowLeftFill,
    }),
  ],
  host: {
    class: 'relative flex flex-col gap-6 mx-auto w-3xl shrink-0',
  },
})
export class App {
  protected readonly pizzaToppings = PIZZA_TOPPINGS;

  protected pizzaMakerModel = signal<PizzaFormModel>({
    toppings: PIZZA_TOPPINGS.map((topping) => ({
      id: topping.id,
      count: 0,
    })),
  });

  protected pizzaMakerForm = form(this.pizzaMakerModel, pizzaMakerSchema);

  protected visibleCounts = computed(() => {
    return new Map(
      this.pizzaMakerModel().toppings.map((topping) => [
        topping.id,
        topping.count,
      ]),
    );
  });
}
