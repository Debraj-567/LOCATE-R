import { Office } from '../entities/Office';

export interface CreateOfficeDTO {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface UpdateOfficeDTO {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  isActive?: boolean;
}

export interface IOfficeRepository {
  findById(id: string): Promise<Office | null>;
  findAll(): Promise<Office[]>;
  create(data: CreateOfficeDTO): Promise<Office>;
  update(id: string, data: UpdateOfficeDTO): Promise<Office>;
  delete(id: string): Promise<void>;
}
