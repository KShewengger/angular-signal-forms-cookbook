import { Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { form, FormField, applyEach } from '@angular/forms/signals';
import {
  NbCard,
  NbCardHeader,
  NbCardTitle,
  NbDisplay,
  NbChip,
  NbChipGroup,
  NbSticker,
  NbSeparator,
  NbCluster,
  NbCallout,
  NbStack,
  NbHalftone,
  NbButtonTrailingIcon,
  NbButton,
  NbText,
} from '@ng-brutalism/ui';
import { PIZZA_TOPPINGS } from './app.data';
import { PizzaFormModel } from './app.model';
import { pizzaToppingItemSchema } from './app.utils';
import { Topping } from './topping/topping';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [
    NgOptimizedImage,
    NbChip,
    NbChipGroup,
    NbCard,
    NbCluster,
    NbCardHeader,
    NbCardTitle,
    NbStack,
    NbDisplay,
    NbHalftone,
    NbSticker,
    NbSeparator,
    FormField,
    NbCallout,
    Topping,
    NbButtonTrailingIcon,
    NbButton,
    NbText,
    NgIcon,
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

  protected pizzaMakerForm = form(this.pizzaMakerModel, (path) => {
    applyEach(path.toppings, pizzaToppingItemSchema);
  });

  protected visibleCounts = computed(() => {
    return new Map(
      this.pizzaMakerModel().toppings.map((topping) => [
        topping.id,
        topping.count,
      ]),
    );
  });
}
