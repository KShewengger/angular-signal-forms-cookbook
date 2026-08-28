import { Component, computed, input } from '@angular/core';
import { type Field } from '@angular/forms/signals';
import { NbText } from '@ng-brutalism/ui';
import { IsFieldInvalidPipe } from '../is-field-invalid';

@Component({
  selector: 'app-validation-errors',
  templateUrl: 'validation-errors.html',
  imports: [NbText, IsFieldInvalidPipe],
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
}
