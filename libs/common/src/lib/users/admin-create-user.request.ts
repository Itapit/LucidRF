import { SystemRole } from './system-role.enum';

export interface AdminCreateUserRequest {
  email: string;
  username: string;
  role: SystemRole;
}
