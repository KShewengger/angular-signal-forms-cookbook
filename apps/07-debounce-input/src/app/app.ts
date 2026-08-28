import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import {
  NbButton,
  NbButtonTrailingIcon,
  NbCallout,
  NbCard,
  NbCardHeader,
  NbCardTitle,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbDisplay,
  NbHalftone,
  NbInput,
  NbInputGroup,
  NbInputPrefix,
  NbMediaFrame,
  NbSeparator,
  NbStack,
  NbStatusDot,
  NbSticker,
  NbText,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerCopyright, tablerSearch } from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';
import { INITIAL_SEARCH, SearchFormModel } from './app.model';
import { searchSchema } from './app.schema';
import { FruitSearch } from './fruit-search.service';
import { ValidationErrors } from './validation-errors';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    NgOptimizedImage,
    NbButton,
    NbButtonTrailingIcon,
    NbCard,
    NbCardHeader,
    NbCardTitle,
    NbMediaFrame,
    NbDisplay,
    NbHalftone,
    NbSticker,
    NbInputGroup,
    NbInputPrefix,
    NbInput,
    NgIcon,
    NbChip,
    NbChipGroup,
    NbCluster,
    NbStack,
    NbSeparator,
    NbText,
    NbCallout,
    NbStatusDot,
    FormField,
    ValidationErrors,
  ],
  viewProviders: [
    provideIcons({
      tablerSearch,
      tablerCopyright,
      tablerCircleArrowLeftFill,
      tablerCircleArrowRightFill,
    }),
  ],
  host: {
    class: 'relative flex flex-col gap-6 mx-auto w-3xl shrink-0',
  },
})
export class App {
  private readonly fruitSearch = inject(FruitSearch);

  private readonly searchModel = signal<SearchFormModel>({ ...INITIAL_SEARCH });

  protected readonly searchForm = form(this.searchModel, searchSchema);

  protected readonly query = computed(() => this.searchForm().value().query);

  protected readonly queryErrors = computed(() =>
    this.searchForm.query().errors(),
  );

  private readonly searchResource = rxResource({
    params: () =>
      this.searchForm.query().valid() ? this.query().trim() : undefined,
    stream: ({ params }) => this.fruitSearch.search(params),
  });

  protected readonly status = this.searchResource.status;

  protected readonly results = computed(() =>
    this.searchResource.hasValue() ? (this.searchResource.value() ?? []) : [],
  );

  private readonly dirty = computed(() => this.searchForm.query().dirty());

  protected readonly isLoading = computed(() => {
    const status = this.status();

    return this.dirty() && (status === 'loading' || status === 'reloading');
  });

  protected readonly isResolved = computed(() => {
    const status = this.status();

    return this.dirty() && (status === 'resolved' || status === 'local');
  });
}
