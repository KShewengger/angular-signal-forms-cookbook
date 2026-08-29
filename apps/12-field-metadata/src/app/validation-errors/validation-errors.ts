import { Component, computed, input } from '@angular/core';
import { type Field } from '@angular/forms/signals';
import { NbText } from '@ng-brutalism/ui';

@Component({
  selector: 'app-validation-errors',
  templateUrl: 'validation-errors.html',
  imports: [NbText],
})
export class ValidationErrors {
  readonly field = input.required<Field<unknown>>();

  protected readonly errors = computed(() => {
    const fieldRef = this.field();

    return fieldRef().errorSummary();
  });

  protected readonly hasMultipleErrors = computed(
    () => this.errors().length > 1,
  );
}
