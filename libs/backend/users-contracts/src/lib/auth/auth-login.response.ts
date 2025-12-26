import { UserDto } from '@LucidRF/common';
import { RefreshTokenDto } from './refresh-token.dto';

export class AuthLoginResponseDto {
  accessToken!: string;
  refreshToken!: RefreshTokenDto;
  user!: UserDto;
}
