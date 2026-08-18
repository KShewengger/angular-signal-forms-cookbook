import { Component, computed, signal } from '@angular/core';
import {
  Booking,
  Experience,
  ImaxExperience,
  VipExperience,
  bookingSchema,
} from './app.model';
import { EXPERIENCES, MEALS } from './app.data';
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

  protected selectExperience(format: Experience['format']): void {
    if (this.selectedFormat() === format) return;

    const next: Experience =
      format === 'imax'
        ? { format, glasses: null }
        : format === 'vip'
          ? { format, mealChoice: '' }
          : { format: 'standard' };

    this.bookingForm.experience().value.set(next);
  }

  // `nb-select` has no "clear" gesture, so closing it counts as finishing the
  // interaction: mark the field touched so an empty selection shows its error.
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

  // Show a field's error only once the user has engaged with it: touched (blurred)
  // or dirty (edited). The variant guard keeps the union getter safe to read.
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
}
