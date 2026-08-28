import { type Field } from '@angular/forms/signals';
import { IsFieldInvalidPipe } from './is-field-invalid';

const fieldOf = (state: {
  dirty: boolean;
  touched: boolean;
  invalid: boolean;
}): Field<unknown> =>
  (() => ({
    dirty: () => state.dirty,
    touched: () => state.touched,
    invalid: () => state.invalid,
  })) as Field<unknown>;

describe('IsFieldInvalidPipe (10 · Dynamic Forms)', () => {
  const pipe = new IsFieldInvalidPipe();

  it('is false while the field is pristine, even if it is invalid', () => {
    expect(
      pipe.transform(fieldOf({ dirty: false, touched: false, invalid: true })),
    ).toBe(false);
  });

  it('is false for a valid field after it is touched', () => {
    expect(
      pipe.transform(fieldOf({ dirty: false, touched: true, invalid: false })),
    ).toBe(false);
  });

  it('is true once an invalid field is touched', () => {
    expect(
      pipe.transform(fieldOf({ dirty: false, touched: true, invalid: true })),
    ).toBe(true);
  });

  it('is true once an invalid field is dirty', () => {
    expect(
      pipe.transform(fieldOf({ dirty: true, touched: false, invalid: true })),
    ).toBe(true);
  });
});
