export function keepOrder(): number {
  return 0;
}

export function fieldTouchedInvalid(field: {
  touched(): boolean;
  invalid(): boolean;
}): boolean {
  return field.touched() && field.invalid();
}
