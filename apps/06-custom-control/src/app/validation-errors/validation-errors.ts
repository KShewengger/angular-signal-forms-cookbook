import { Component, computed, input } from '@angular/core';
import { ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';
import { NbText } from '@ng-brutalism/ui';

@Component({
  selector: 'app-validation-errors',
  templateUrl: 'validation-errors.html',
  imports: [NbText],
})
export class ValidationErrors {
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>(
    [],
  );

  readonly visible = input(false);

  protected readonly hasMultipleErrors = computed(
    () => this.errors().length > 1,
  );
}
