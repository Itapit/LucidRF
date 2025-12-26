export class RefreshTokenDto {
  token!: string;
  expiresAt!: Date;
  createdAt?: Date;
}
