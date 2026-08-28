import { Pipe, PipeTransform } from '@angular/core';
import { type Field } from '@angular/forms/signals';

@Pipe({
  name: 'isFieldInvalid',
  pure: false,
})
export class IsFieldInvalidPipe implements PipeTransform {
  transform(field: Field<unknown>): boolean {
    const state = field();

    return (state.dirty() || state.touched()) && state.invalid();
  }
}
