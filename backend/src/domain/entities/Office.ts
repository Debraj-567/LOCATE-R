export interface Office {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
