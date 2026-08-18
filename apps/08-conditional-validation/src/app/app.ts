import { Component, computed, signal } from '@angular/core';
import {
  Booking,
  Experience,
  ImaxExperience,
  VipExperience,
  bookingSchema,
} from './app.model';
import { EXPERIENCES, MEALS } from './app.data';
import { createExperience } from './app.utils';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import {
  NbButton,
  NbCallout,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbInput,
  NbLabel,
  NbMediaFrame,
  NbSelect,
  NbSelectOption,
  NbSeparator,
  NbSplit,
  NbStack,
  NbSticker,
  NbSurface,
  NbText,
} from '@ng-brutalism/ui';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerSquareNumber1Fill } from '@ng-icons/tabler-icons/fill';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'relative flex flex-col gap-6 mx-auto w-4xl shrink-0',
  },
  imports: [
    NbStack,
    NbButton,
    NbChip,
    NbChipGroup,
    NbCluster,
    NbCallout,
    NbSeparator,
    NgOptimizedImage,
    NbMediaFrame,
    NbSurface,
    NbSticker,
    NgIcon,
    NbSplit,
    NbText,
    NbInput,
    NbLabel,
    NbSelect,
    NbSelectOption,
    FormField,
  ],
  viewProviders: [provideIcons({ tablerSquareNumber1Fill })],
})
export class App {
  protected readonly bookingModel = signal<Booking>({
    tickets: [],
    addSnacks: false,
    comboSize: '',
    experience: { format: 'standard' },
    promoCode: '',
  });

  protected readonly bookingForm = form(this.bookingModel, bookingSchema);

  protected readonly experiences = EXPERIENCES;
  protected readonly meals = MEALS;

  protected readonly selectedFormat = computed(
    () => this.bookingForm.experience().value().format,
  );

  protected readonly glassesInvalid = computed(() => {
    if (this.selectedFormat() !== 'imax') return false;

    const field = this.glassesField();

    return (field.dirty() || field.touched()) && field.invalid();
  });

  protected readonly mealInvalid = computed(() => {
    if (this.selectedFormat() !== 'vip') return false;

    const field = this.mealField();

    return (field.dirty() || field.touched()) && field.invalid();
  });

  protected selectExperience(format: Experience['format']): void {
    if (this.selectedFormat() === format) return;

    this.bookingForm.experience().value.set(createExperience(format));
  }

  protected markMealTouched(open: boolean): void {
    if (!open) this.mealField().markAsTouched();
  }

  private variant<V extends Experience>(): FieldTree<V> {
    return this.bookingForm.experience as unknown as FieldTree<V>;
  }

  protected get glassesField(): FieldTree<number | null> {
    return this.variant<ImaxExperience>().glasses;
  }

  protected get mealField(): FieldTree<string> {
    return this.variant<VipExperience>().mealChoice;
  }
}
