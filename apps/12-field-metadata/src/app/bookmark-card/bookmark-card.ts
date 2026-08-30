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

  protected readonly titleField = computed(() => this.field().title);
  protected readonly urlField = computed(() => this.field().url);

  protected readonly count = computed(() => this.titleField()().value().length);
  protected readonly limit = computed(
    () => this.titleField()().metadata(MAX_LENGTH)?.() ?? TITLE_MAX_LENGTH,
  );
  protected readonly nearLimit = computed(
    () => this.count() >= this.limit() - 8 && this.count() < this.limit(),
  );
  protected readonly atLimit = computed(() => this.count() >= this.limit());

  protected readonly platform = computed(() =>
    this.urlField()().metadata(PLATFORM)?.(),
  );
  protected readonly status = computed(() =>
    this.field()().metadata(STATUS)?.(),
  );
  protected readonly preview = computed(() =>
    this.urlField()().metadata(URL_PREVIEW),
  );
  protected readonly help = computed(
    () => this.urlField()().metadata(HELP)?.() ?? [],
  );

  protected readonly titleId = computed(
    () => `title-${this.field()().value().id}`,
  );
  protected readonly urlId = computed(() => `url-${this.field()().value().id}`);
}
