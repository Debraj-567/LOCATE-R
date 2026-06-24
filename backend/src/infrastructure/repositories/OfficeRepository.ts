import { prisma } from '../../config/database';
import { Office } from '../../domain/entities/Office';
import { IOfficeRepository, CreateOfficeDTO, UpdateOfficeDTO } from '../../domain/repositories/IOfficeRepository';

export class OfficeRepository implements IOfficeRepository {
  async findById(id: string): Promise<Office | null> {
    return prisma.office.findUnique({ where: { id } }) as Promise<Office | null>;
  }

  async findAll(): Promise<Office[]> {
    return prisma.office.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }) as Promise<Office[]>;
  }

  async create(data: CreateOfficeDTO): Promise<Office> {
    return prisma.office.create({ data }) as Promise<Office>;
  }

  async update(id: string, data: UpdateOfficeDTO): Promise<Office> {
    return prisma.office.update({ where: { id }, data }) as Promise<Office>;
  }

  async delete(id: string): Promise<void> {
    await prisma.office.update({ where: { id }, data: { isActive: false } });
  }
}
