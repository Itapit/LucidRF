import { UserDto } from '@LucidRF/common';
import { UserEntity } from '../entities/user.entity';

export function toUserDto(entity: UserEntity): UserDto {
  return {
    id: entity.id,
    email: entity.email,
    username: entity.username,
    role: entity.role,
    status: entity.status,
  };
}
