import {
  apply,
  debounce,
  email,
  required,
  schema,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import { UserFormModel } from './app.model';

const emailSchema = schema<string>((path) => {
  required(path, { message: 'Please enter your email.' });
  email(path, { message: 'Please enter a valid email address' });
  debounce(path, 250);
});

export function userSchema(path: SchemaPathTree<UserFormModel>): void {
  apply(path.email, emailSchema);
  apply(path.confirmEmail, emailSchema);
  validate(path.confirmEmail, ({ value, valueOf }) => {
    const email = valueOf(path.email);

    if (!email || !value()) return null;

    if (email.trim().toLowerCase() !== value().trim().toLowerCase()) {
      return {
        kind: 'emailMismatch',
        message: 'Email addresses do not match.',
      };
    }

    return null;
  });
}
