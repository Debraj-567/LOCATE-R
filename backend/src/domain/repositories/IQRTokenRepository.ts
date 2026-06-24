export interface QRToken {
  id: string;
  token: string;
  officeId: string;
  expiresAt: Date;
  usedAt: Date | null;
  isUsed: boolean;
  createdAt: Date;
}

export interface IQRTokenRepository {
  create(officeId: string, token: string, expiresAt: Date): Promise<QRToken>;
  findByToken(token: string): Promise<QRToken | null>;
  markAsUsed(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
