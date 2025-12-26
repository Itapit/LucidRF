import { RefreshTokenDto } from '@LucidRF/users-contracts';
import { RefreshTokenEntity } from '../entities';

export function toRefreshTokenDto(entity: RefreshTokenEntity): RefreshTokenDto {
  return {
    token: entity.jti,
    expiresAt: entity.expiresAt,
  };
}
