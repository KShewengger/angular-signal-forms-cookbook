import { Component, computed, input, Signal } from '@angular/core';
import { FieldTree, MetadataKey } from '@angular/forms/signals';
import { NbText } from '@ng-brutalism/ui';

type HintKey = MetadataKey<Signal<string[]>, string | undefined, string[]>;

@Component({
  selector: 'app-metadata-hints',
  imports: [NbText],
  host: { class: 'flex min-w-0 flex-wrap justify-end gap-x-3 text-right' },
  template: `
    @for (hint of hints(); track hint) {
      <small nbText tone="muted" size="xs">{{ hint }}</small>
    }
  `,
})
export class MetadataHints {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<HintKey>();

  protected readonly hints = computed(() => {
    const state = this.field();
    return state().metadata(this.key())?.() ?? [];
  });
}
