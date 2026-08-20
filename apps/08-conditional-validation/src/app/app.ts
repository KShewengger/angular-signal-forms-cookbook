import { Component, computed, signal } from '@angular/core';
import {
  Booking,
  Experience,
  INITIAL_BOOKING,
  ImaxExperience,
  VipExperience,
} from './app.model';
import { bookingSchema } from './app.schema';
import {
  COMBO_SIZES,
  EXPERIENCES,
  MEALS,
  PROMO_CODE,
  SEATS,
  SEAT_LEGEND,
} from './app.data';
import { createExperience } from './app.utils';
import { FieldTree, form, FormField, submit } from '@angular/forms/signals';
import {
  NbButton,
  NbButtonTrailingIcon,
  NbCallout,
  NbCheckbox,
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
import { tablerCopyright, tablerRefresh } from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
  tablerSquareNumber1Fill,
  tablerSquareNumber2Fill,
  tablerSquareNumber3Fill,
} from '@ng-icons/tabler-icons/fill';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    class: 'relative flex flex-col gap-6 mx-auto w-4xl shrink-0',
  },
  imports: [
    NbStack,
    NbButton,
    NbButtonTrailingIcon,
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
    NbCheckbox,
    NbSelect,
    NbSelectOption,
    FormField,
  ],
  viewProviders: [
    provideIcons({
      tablerSquareNumber1Fill,
      tablerSquareNumber2Fill,
      tablerSquareNumber3Fill,
      tablerCircleArrowLeftFill,
      tablerCircleArrowRightFill,
      tablerCopyright,
      tablerRefresh,
    }),
  ],
})
export class App {
  protected readonly bookingModel = signal<Booking>({ ...INITIAL_BOOKING });

  protected readonly bookingForm = form(this.bookingModel, bookingSchema);

  protected readonly experiences = EXPERIENCES;
  protected readonly meals = MEALS;
  protected readonly comboSizes = COMBO_SIZES;
  protected readonly seats = SEATS;
  protected readonly seatLegend = SEAT_LEGEND;

  protected readonly selectedSeats = computed(
    () =>
      new Set(
        this.bookingForm
          .tickets()
          .value()
          .map((ticket) => ticket.seat),
      ),
  );

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

  protected readonly comboInvalid = computed(() => {
    const field = this.bookingForm.comboSize();

    return (field.dirty() || field.touched()) && field.invalid();
  });

  protected readonly seatCount = computed(() => this.selectedSeats().size);

  protected readonly promoDisabled = computed(() =>
    this.bookingForm.promoCode().disabled(),
  );

  protected readonly promoPlaceholder = computed(() =>
    this.promoDisabled()
      ? `Add ${Math.max(0, 4 - this.seatCount())} more seat(s) to unlock`
      : `e.g. ${PROMO_CODE}`,
  );

  private readonly subtotal = computed(() => {
    const price =
      this.experiences.find((option) => option.format === this.selectedFormat())
        ?.price ?? 0;

    return price * this.seatCount();
  });

  protected readonly promoApplied = computed(
    () =>
      !this.promoDisabled() &&
      this.bookingForm.promoCode().value().trim().toUpperCase() === PROMO_CODE,
  );

  protected readonly couponInvalid = computed(() => {
    const field = this.bookingForm.promoCode();

    return (field.dirty() || field.touched()) && field.invalid();
  });

  protected readonly subtotalDisplay = computed(
    () => `$${this.subtotal().toFixed(2)}`,
  );

  protected readonly orderTotal = computed(() => {
    const total = this.promoApplied() ? this.subtotal() / 2 : this.subtotal();

    return `$${total.toFixed(2)}`;
  });

  protected readonly canBook = computed(
    () => this.bookingForm().valid() && this.seatCount() > 0,
  );

  protected readonly booked = signal(false);

  protected selectExperience(format: Experience['format']): void {
    if (this.selectedFormat() === format) return;

    this.bookingForm.experience().value.set(createExperience(format));
  }

  protected toggleSeat(seat: string): void {
    const tickets = this.bookingForm.tickets().value();

    this.bookingForm
      .tickets()
      .value.set(
        this.selectedSeats().has(seat)
          ? tickets.filter((ticket) => ticket.seat !== seat)
          : [...tickets, { seat }],
      );
  }

  protected markMealTouched(open: boolean): void {
    if (!open) this.mealField().markAsTouched();
  }

  protected markComboTouched(open: boolean): void {
    if (!open) this.bookingForm.comboSize().markAsTouched();
  }

  // First click reserves: `submit()` marks every field touched, then the action
  // runs only if the form is valid. A reserved order locks its fields, so the
  // button turns into a reset that clears the form and re-enables editing.
  protected book(): void {
    if (this.booked()) {
      this.bookingForm().reset({ ...INITIAL_BOOKING });
      this.booked.set(false);
      return;
    }

    submit(this.bookingForm, async () => {
      this.booked.set(true);
    });
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
