import { required, schema } from '@angular/forms/signals';
import { RegistrationFormModel } from './app.model';

export const registrationSchema = schema<RegistrationFormModel>((path) => {
  required(path.name);
});
