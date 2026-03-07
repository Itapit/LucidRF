import { SystemRole } from './system-role.enum';

export interface CreateUserRequest {
  email: string;
  username: string;
  role: SystemRole;
}
