import { UserDto } from '@LucidRF/common';

export class AuthLoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: UserDto;
}
