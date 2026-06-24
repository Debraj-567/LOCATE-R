export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  officeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublic = Omit<User, 'password'>;
