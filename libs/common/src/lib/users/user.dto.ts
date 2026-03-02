import { SystemRole } from './system-role.enum';
import { UserStatus } from './user-status.enum';

export interface UserDto {
  id: string;
  email: string;
  username: string;
  role: SystemRole;
  status: UserStatus;
}
