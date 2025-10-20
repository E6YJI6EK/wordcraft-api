export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// User types
export interface IUser {
  email: string;
  password: string;
  login: string;
  role: UserRole;
  avatarUrl: string | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
