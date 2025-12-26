import { RefreshTokenDto } from '@LucidRF/users-contracts';

export class GeneratedTokensDto {
  accessToken: string;
  refreshToken: RefreshTokenDto;
  jti: string;
}
