import { Component, computed, input, output } from '@angular/core';
import { FieldTree, FormField, MAX_LENGTH } from '@angular/forms/signals';
import {
  NbBadge,
  NbCard,
  NbCardContent,
  NbIconButton,
  NbInput,
  NbLabel,
  NbStack,
  NbStatusDot,
  NbText,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerX } from '@ng-icons/tabler-icons';
import {
  PLATFORMS,
  SEVERITY_STATE,
  SEVERITY_TONE,
  TITLE_MAX_LENGTH,
} from '../app.data';
import type { Bookmark } from '../app.model';
import { HELP, PLATFORM, STATUS, URL_PREVIEW } from '../app.metadata';
import { ValidationErrors } from '../validation-errors';

@Component({
  selector: 'app-bookmark-card',
  templateUrl: './bookmark-card.html',
  styleUrl: './bookmark-card.css',
  imports: [
    FormField,
    NbBadge,
    NbCard,
    NbCardContent,
    NbIconButton,
    NbInput,
    NbLabel,
    NbStack,
    NbStatusDot,
    NbText,
    NgIcon,
    ValidationErrors,
  ],
  viewProviders: [provideIcons({ tablerX })],
})
export class BookmarkCard {
  readonly field = input.required<FieldTree<Bookmark>>();
  readonly remove = output<void>();

  protected readonly platforms = PLATFORMS;
  protected readonly severityTone = SEVERITY_TONE;
  protected readonly severityState = SEVERITY_STATE;

  protected readonly fieldState = computed(() => this.field()());
  protected readonly titleState = computed(() => this.field().title());
  protected readonly urlState = computed(() => this.field().url());

  protected readonly count = computed(() => this.titleState().value().length);
  protected readonly limit = computed(
    () => this.titleState().metadata(MAX_LENGTH)?.() ?? TITLE_MAX_LENGTH,
  );
  protected readonly nearLimit = computed(
    () => this.count() >= this.limit() - 8 && this.count() < this.limit(),
  );
  protected readonly atLimit = computed(() => this.count() >= this.limit());

  protected readonly status = computed(() =>
    this.fieldState().metadata(STATUS)?.(),
  );
  protected readonly platform = computed(() =>
    this.urlState().metadata(PLATFORM)?.(),
  );
  protected readonly preview = computed(() =>
    this.urlState().metadata(URL_PREVIEW),
  );
  protected readonly help = computed(
    () => this.urlState().metadata(HELP)?.() ?? [],
  );

  protected readonly bookmarkId = computed(() => this.fieldState().value().id);
  protected readonly titleId = computed(() => `title-${this.bookmarkId()}`);
  protected readonly urlId = computed(() => `url-${this.bookmarkId()}`);
}
