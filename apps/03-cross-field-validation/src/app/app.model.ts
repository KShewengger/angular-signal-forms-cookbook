import {
  apply,
  debounce,
  email,
  required,
  schema,
  validate,
} from '@angular/forms/signals';

export type UserFormModel = {
  email: string;
  confirmEmail: string;
};

export const INITIAL_USER: UserFormModel = {
  email: '',
  confirmEmail: '',
};

const emailSchema = schema<string>((path) => {
  required(path, { message: 'Please enter your email.' });
  email(path, { message: 'Please enter a valid email address' });
  debounce(path, 250);
});

export const userSchema = schema<UserFormModel>((path) => {
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
});
