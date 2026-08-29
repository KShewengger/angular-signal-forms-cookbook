import { Component, computed, signal } from '@angular/core';
import { form, FormField, MAX_LENGTH } from '@angular/forms/signals';
import {
  NbBadge,
  NbButton,
  NbButtonTrailingIcon,
  NbCallout,
  NbCard,
  NbCardContent,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbDisplay,
  NbIconButton,
  NbInput,
  NbLabel,
  NbSeparator,
  NbStack,
  NbStatusDot,
  NbSticker,
  NbText,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerCopyright, tablerPlus, tablerX } from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';
import {
  PLATFORMS,
  SEVERITY_STATE,
  SEVERITY_TONE,
  TITLE_MAX_LENGTH,
} from './app.data';
import { BookmarkCollection, INITIAL_COLLECTION } from './app.model';
import { PLATFORM, STATUS, URL_PREVIEW } from './app.metadata';
import { bookmarkHubSchema } from './app.schema';
import { ValidationErrors } from './validation-errors';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    class: 'relative mx-auto flex w-4xl max-w-full shrink-0 flex-col gap-6',
  },
  imports: [
    FormField,
    NbBadge,
    NbButton,
    NbButtonTrailingIcon,
    NbCallout,
    NbCard,
    NbCardContent,
    NbChip,
    NbChipGroup,
    NbCluster,
    NbDisplay,
    NbIconButton,
    NbInput,
    NbLabel,
    NbSeparator,
    NbStack,
    NbStatusDot,
    NbSticker,
    NbText,
    NgIcon,
    ValidationErrors,
  ],
  viewProviders: [
    provideIcons({
      tablerCircleArrowLeftFill,
      tablerCircleArrowRightFill,
      tablerCopyright,
      tablerPlus,
      tablerX,
    }),
  ],
})
export class App {
  protected readonly platforms = PLATFORMS;
  protected readonly severityTone = SEVERITY_TONE;
  protected readonly severityState = SEVERITY_STATE;
  protected readonly titleMax = TITLE_MAX_LENGTH;
  protected readonly maxLengthKey = MAX_LENGTH;
  protected readonly platformKey = PLATFORM;
  protected readonly statusKey = STATUS;
  protected readonly previewKey = URL_PREVIEW;

  private sequence = 0;

  protected readonly collection = signal<BookmarkCollection>({
    bookmarks: INITIAL_COLLECTION.bookmarks.map((bookmark) => ({
      ...bookmark,
    })),
  });

  protected readonly bookmarkForm = form(this.collection, bookmarkHubSchema);

  protected readonly bookmarks = computed(() =>
    this.bookmarkForm.bookmarks().value(),
  );

  protected addBookmark(): void {
    this.sequence += 1;
    const id = `bm-${this.sequence}`;

    this.bookmarkForm
      .bookmarks()
      .value.update((list) => [...list, { id, title: '', url: '' }]);
  }

  protected removeBookmark(index: number): void {
    this.bookmarkForm
      .bookmarks()
      .value.update((list) => list.filter((_, position) => position !== index));
  }
}
