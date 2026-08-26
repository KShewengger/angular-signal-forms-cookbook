import { Component, computed, input } from '@angular/core';
import { type Field } from '@angular/forms/signals';
import { NbText } from '@ng-brutalism/ui';

@Component({
  selector: 'app-validation-errors',
  templateUrl: 'validation-errors.html',
  imports: [NbText],
  host: {
    class: 'contents',
  },
})
export class ValidationErrors {
  readonly field = input<Field<unknown> | null>(null);

  readonly messages = input<readonly string[]>([]);

  protected readonly errors = computed(() => {
    const messages = this.messages();

    if (messages.length > 0) {
      return messages.map((message, index) => ({
        kind: `message-${index}`,
        message,
      }));
    }

    const fieldRef = this.field();
    return fieldRef ? fieldRef().errorSummary() : [];
  });

  protected readonly hasMultipleErrors = computed(
    () => this.errors().length > 1,
  );

  protected readonly visible = computed(() => {
    if (this.messages().length > 0) return true;

    const fieldRef = this.field();
    if (!fieldRef) return false;

    return (fieldRef().dirty() || fieldRef().touched()) && fieldRef().invalid();
  });
}
