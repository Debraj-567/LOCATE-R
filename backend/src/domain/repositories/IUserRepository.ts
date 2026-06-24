import { User, UserPublic } from '../entities/User';

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'EMPLOYEE';
  officeId?: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  officeId?: string;
  isActive?: boolean;
  role?: 'ADMIN' | 'EMPLOYEE';
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<{ users: UserPublic[]; total: number }>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<UserPublic>;
  delete(id: string): Promise<void>;
  findByOfficeId(officeId: string): Promise<UserPublic[]>;
}
