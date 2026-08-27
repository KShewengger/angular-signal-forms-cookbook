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
  readonly field = input.required<Field<unknown>>();

  readonly messageId = input<string>();

  protected readonly errors = computed(() => this.field()().errorSummary());

  protected readonly hasMultipleErrors = computed(
    () => this.errors().length > 1,
  );

  protected readonly visible = computed(() => {
    const fieldRef = this.field();
    return (fieldRef().dirty() || fieldRef().touched()) && fieldRef().invalid();
  });
}
