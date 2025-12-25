import { UserRole, UserStatus } from '@LucidRF/common';

export class UserEntity {
  id: string;
  email: string;
  password?: string;
  username: string;
  role: UserRole;
  status: UserStatus;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
