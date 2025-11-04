import { UserDto } from '../users/user.dto';

export interface LoginResponse {
  accessToken: string;
  user: UserDto;
  // refreshToken will be in an httpOnly cookie
}
