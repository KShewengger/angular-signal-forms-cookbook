import type { RegistrationFormModel } from './app.model';

export type RoleOption = {
  value: NonNullable<RegistrationFormModel['role']>;
  label: string;
};

export const ROLES: RoleOption[] = [
  { value: 'admin', label: $localize`:@@roleAdminOption:Admin` },
  { value: 'moderator', label: $localize`:@@roleModeratorOption:Moderator` },
  { value: 'user', label: $localize`:@@roleUserOption:User` },
];
