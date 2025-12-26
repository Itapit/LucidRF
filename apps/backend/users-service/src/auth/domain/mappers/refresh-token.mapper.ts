import { RefreshTokenDocument } from '../../infrastructure/schemas';
import { RefreshTokenEntity } from '../entities';

export function toRefreshTokenEntity(doc: RefreshTokenDocument): RefreshTokenEntity {
  if (!doc) return null;

  const obj = doc.toObject();

  return new RefreshTokenEntity({
    id: obj._id.toString(), // Explicitly convert _id to string id
    userId: obj.userId.toString(), // Convert relational ObjectId to string
    jti: obj.jti,
    expiresAt: obj.expiresAt,
    userAgent: obj.userAgent,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  });
}
