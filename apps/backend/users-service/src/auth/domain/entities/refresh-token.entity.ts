export class RefreshTokenEntity {
  id: string;
  userId: string;
  jti: string;
  expiresAt: Date;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<RefreshTokenEntity>) {
    Object.assign(this, partial);
  }
}
