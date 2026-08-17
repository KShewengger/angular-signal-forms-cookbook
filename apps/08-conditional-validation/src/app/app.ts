import { Component, computed, signal } from '@angular/core';
import { Booking, bookingSchema } from './app.model';
import { EXPERIENCES } from './app.data';
import { form } from '@angular/forms/signals';
import {
  NbButton,
  NbCallout,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbIconButton,
  NbMediaFrame,
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
    NbIconButton,
    NgIcon,
    NbSplit,
    NbText,
  ],
  providers: [provideIcons({ tablerSquareNumber1Fill })],
})
export class App {
  protected bookingModel = signal<Booking>({
    tickets: [],
    addSnacks: false,
    comboSize: '',
    experience: { format: 'standard' },
    promoCode: '',
  });

  protected form = form(this.bookingModel, bookingSchema);

  protected readonly experiences = EXPERIENCES;

  protected selectedFormat = computed(
    () => this.form.experience().value().format,
  );
}
