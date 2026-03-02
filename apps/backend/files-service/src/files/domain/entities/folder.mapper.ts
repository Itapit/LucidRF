import { FolderDto } from '@LucidRF/common';
import { FolderEntity } from './folder.entity';

export function toFolderDto(entity: FolderEntity): FolderDto {
  return {
    resourceId: entity.id,
    name: entity.name,
    teamId: entity.teamId,
    parentFolderId: entity.parentFolderId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
