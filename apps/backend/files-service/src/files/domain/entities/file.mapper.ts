import { FileDto } from '@LucidRF/common';
import { FileEntity } from './file.entity';

export function toFileDto(entity: FileEntity): FileDto {
  return {
    resourceId: entity._id.toString(),
    originalFileName: entity.originalFileName,
    mimeType: entity.mimeType,
    size: entity.size,
    status: entity.status,
    ownerId: entity.ownerId,
    parentFolderId: entity.parentFolderId,
    permissions: entity.permissions || [],
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
