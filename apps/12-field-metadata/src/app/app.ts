import { Component, computed, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import {
  NbBadge,
  NbButton,
  NbButtonTrailingIcon,
  NbCallout,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbDisplay,
  NbSeparator,
  NbStack,
  NbSticker,
  NbText,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerCopyright, tablerPlus } from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';
import { BookmarkCard } from './bookmark-card';
import { INITIAL_COLLECTION, PRIORITY_MIN } from './app.data';
import { BookmarkCollection } from './app.model';
import { bookmarkHubSchema } from './app.schema';
import { sortPriority } from './app.utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    class: 'relative mx-auto flex w-3xl max-w-full shrink-0 flex-col gap-6',
  },
  imports: [
    BookmarkCard,
    NbBadge,
    NbButton,
    NbButtonTrailingIcon,
    NbCallout,
    NbChip,
    NbChipGroup,
    NbCluster,
    NbDisplay,
    NbSeparator,
    NbStack,
    NbSticker,
    NbText,
    NgIcon,
  ],
  viewProviders: [
    provideIcons({
      tablerCircleArrowLeftFill,
      tablerCircleArrowRightFill,
      tablerCopyright,
      tablerPlus,
    }),
  ],
})
export class App {
  protected readonly collection = signal<BookmarkCollection>({
    bookmarks: INITIAL_COLLECTION.bookmarks.map((bookmark) => ({
      ...bookmark,
    })),
  });

  protected readonly bookmarkForm = form(this.collection, bookmarkHubSchema);

  protected readonly bookmarks = computed(() =>
    this.bookmarkForm.bookmarks().value(),
  );

  protected readonly orderedBookmarks = computed(() =>
    this.bookmarks()
      .map((bookmark, index) => ({ bookmark, index }))
      .sort(
        (a, b) =>
          Number(b.bookmark.pinned) - Number(a.bookmark.pinned) ||
          sortPriority(b.bookmark) - sortPriority(a.bookmark),
      ),
  );

  protected addBookmark(): void {
    this.bookmarkForm.bookmarks().value.update((list) => [
      ...list,
      {
        id: crypto.randomUUID(),
        title: '',
        url: '',
        priority: PRIORITY_MIN,
        tag: '',
        pinned: false,
      },
    ]);
  }

  protected removeBookmark(index: number): void {
    this.bookmarkForm
      .bookmarks()
      .value.update((list) => list.filter((_, position) => position !== index));
  }
}
