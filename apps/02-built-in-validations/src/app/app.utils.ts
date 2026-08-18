// `KeyValuePipe` sorts by key by default. This comparator keeps the model's own
// field order so the summary reads username, email, age, role, bio, beginner.
export function keepOrder(): number {
  return 0;
}
