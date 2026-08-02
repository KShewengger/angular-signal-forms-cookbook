import { required, schema } from '@angular/forms/signals';

export type RegistrationFormModel = {
  name: string;
  age: number | null;
  role: 'admin' | 'moderator' | 'user' | null;
  bio: string;
  beginner: boolean;
};

export const INITIAL_REGISTRATION: RegistrationFormModel = {
  name: '',
  age: null,
  role: null,
  bio: '',
  beginner: false,
};

export const registrationSchema = schema<RegistrationFormModel>((path) => {
  required(path.name);
});
