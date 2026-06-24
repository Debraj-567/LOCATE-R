import { prisma } from '../../config/database';
import { User, UserPublic } from '../../domain/entities/User';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../../domain/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } }) as Promise<User | null>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } }) as Promise<User | null>;
  }

  async findAll(page: number, limit: number): Promise<{ users: UserPublic[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isActive: true, officeId: true, createdAt: true, updatedAt: true,
          office: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return { users: users as unknown as UserPublic[], total };
  }

  async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({ data }) as Promise<User>;
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserPublic> {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, officeId: true, createdAt: true, updatedAt: true,
      },
    });
    return user as unknown as UserPublic;
  }

  async delete(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  async findByOfficeId(officeId: string): Promise<UserPublic[]> {
    const users = await prisma.user.findMany({
      where: { officeId, isActive: true },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, officeId: true, createdAt: true, updatedAt: true,
      },
    });
    return users as unknown as UserPublic[];
  }
}
