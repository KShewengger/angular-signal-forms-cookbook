export type RegistrationFormModel = {
  username: string;
  email: string;
  age: number | null;
  role: 'admin' | 'moderator' | 'user' | null;
  bio: string;
  beginner: boolean;
};
