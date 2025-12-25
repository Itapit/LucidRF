import { UserDocument } from '../../infrastructure/schemas/user.schema';
import { UserEntity } from '../entities/user.entity';

export function toUserEntity(doc: UserDocument): UserEntity {
  if (!doc) return null;

  const obj = doc.toObject();

  return new UserEntity({
    id: obj._id.toString(),
    email: obj.email,
    password: obj.password,
    username: obj.username,
    role: obj.role,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  });
}
