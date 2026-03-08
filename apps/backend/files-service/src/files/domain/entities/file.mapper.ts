import { FileDto } from '@LucidRF/common';
import { FileEntity } from './file.entity';

export function toFileDto(entity: FileEntity): FileDto {
  return {
    resourceId: entity.id,
    originalFileName: entity.originalFileName,
    mimeType: entity.mimeType,
    size: entity.size,
    status: entity.status,
    teamId: entity.teamId,
    parentFolderId: entity.parentFolderId,
    uploadedBy: entity.uploadedBy,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
