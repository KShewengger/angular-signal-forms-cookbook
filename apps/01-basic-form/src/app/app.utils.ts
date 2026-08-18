// `KeyValuePipe` sorts by key by default. This comparator keeps the model's own
// field order so the summary reads name, age, role, bio, beginner.
export function keepOrder(): number {
  return 0;
}
