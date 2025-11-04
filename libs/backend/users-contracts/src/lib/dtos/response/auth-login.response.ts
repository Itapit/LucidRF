import { UserDto } from '@limbo/common';

export class AuthLoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: UserDto;
}
