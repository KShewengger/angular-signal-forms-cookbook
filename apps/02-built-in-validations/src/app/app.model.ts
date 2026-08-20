export type RegistrationFormModel = {
  username: string;
  email: string;
  age: number | null;
  role: 'admin' | 'moderator' | 'user' | null;
  bio: string;
  beginner: boolean;
};

export const INITIAL_REGISTRATION: RegistrationFormModel = {
  username: '',
  email: '',
  age: null,
  role: null,
  bio: '',
  beginner: false,
};
