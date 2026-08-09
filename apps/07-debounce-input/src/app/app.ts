import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import {
  NbCallout,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbInput,
  NbInputGroup,
  NbInputPrefix,
  NbSeparator,
  NbStack,
  NbStatusDot,
  NbText,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerCopyright, tablerSearch } from '@ng-icons/tabler-icons';
import { INITIAL_SEARCH, SearchFormModel, searchSchema } from './app.model';
import { FruitSearch } from './fruit-search.service';
import { ValidationErrors } from './validation-errors';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [
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
  providers: [provideIcons({ tablerSearch, tablerCopyright })],
  host: {
    class: 'relative flex flex-col gap-6 mx-auto w-3xl shrink-0',
  },
})
export class App {
  private fruitSearch = inject(FruitSearch);

  private searchModel = signal<SearchFormModel>({ ...INITIAL_SEARCH });

  protected searchForm = form(this.searchModel, searchSchema);

  protected query = computed(() => this.searchForm().value().query);

  protected queryErrors = computed(() => this.searchForm.query().errors());

  protected queryInvalid = computed(() => {
    const field = this.searchForm.query();
    return (field.dirty() || field.touched()) && field.invalid();
  });

  private searchResource = rxResource({
    params: () =>
      this.searchForm.query().valid() ? this.query().trim() : undefined,
    stream: ({ params }) => this.fruitSearch.search(params),
  });

  protected status = this.searchResource.status;

  protected results = computed(() =>
    this.searchResource.hasValue() ? (this.searchResource.value() ?? []) : [],
  );

  private dirty = computed(() => this.searchForm.query().dirty());

  protected isLoading = computed(() => {
    const status = this.status();
    return this.dirty() && (status === 'loading' || status === 'reloading');
  });

  protected isResolved = computed(() => {
    const status = this.status();
    return this.dirty() && (status === 'resolved' || status === 'local');
  });
}
