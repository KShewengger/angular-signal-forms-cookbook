import {
  email,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  schema,
} from '@angular/forms/signals';
import { RegistrationFormModel } from './app.model';

export const registrationSchema = schema<RegistrationFormModel>((path) => {
  required(path.username, {
    message: 'Please enter a username.',
  });
  minLength(path.username, 5, {
    message: 'Username must be at least 5 characters long.',
  });
  maxLength(path.username, 20, {
    message: 'Username cannot exceed 20 characters.',
  });
  pattern(path.username, /^USER-\d{3}$/, {
    message: 'Username must follow the format USER-123.',
  });

  required(path.email, {
    message: 'Please enter your email address.',
  });
  email(path.email, {
    message: 'Please enter a valid email address.',
  });

  required(path.age, {
    message: 'Please enter your age.',
  });
  min(path.age, 10, {
    message: 'You must be at least 10 years old.',
  });

  required(path.role, {
    message: 'Please select a role.',
  });

  required(path.bio, {
    message: 'Please enter a short bio.',
  });
  minLength(path.bio, 5, {
    message: 'Bio must be at least 5 characters long.',
  });
});
