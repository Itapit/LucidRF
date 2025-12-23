import { FolderDto } from '@LucidRF/common';
import { FolderEntity } from './folder.entity';

export function toFolderDto(entity: FolderEntity): FolderDto {
  return {
    resourceId: entity._id.toString(),
    name: entity.name,
    ownerId: entity.ownerId,
    parentFolderId: entity.parentFolderId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    permissions: entity.permissions || [],
  };
}
