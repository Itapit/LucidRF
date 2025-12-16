import { FileStatus } from '@LucidRF/common';
import {
  ConfirmUploadPayload,
  DeleteResourcePayload,
  GetDownloadUrlPayload,
  InitializeUploadPayload,
} from '@LucidRF/files-contracts';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../../storage/storage.service';
import { CreateFileRepoDto } from '../domain/dtos/create-file-repo.dto';
import { AccessLevel, ResourceType } from '../domain/enums';
import { FileEntity } from '../domain/file.entity';
import { FileRepository } from '../domain/file.repository';
import { FolderRepository } from '../domain/folder.repository';
import { AclService } from './acl.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly bucketName: string;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository,
    private readonly storageService: StorageService,
    private readonly aclService: AclService,
    private readonly configService: ConfigService
  ) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');
  }

  async initializeUpload(payload: InitializeUploadPayload) {
    const { userId, originalFileName, parentFolderId } = payload;

    if (parentFolderId) {
      const parent = await this.folderRepository.findById(parentFolderId);
      if (!parent || parent.ownerId !== userId) throw new NotFoundException('Parent folder invalid');
    }

    if (parentFolderId) {
      await this.aclService.validateAccess(parentFolderId, userId, ResourceType.FOLDER, AccessLevel.OWNER);
    }

    const uniqueSuffix = uuidv4();
    const storageKey = `uploads/${userId}/${uniqueSuffix}-${originalFileName}`;
    const uploadUrl = await this.storageService.getPresignedPutUrl(storageKey);

    const dto: CreateFileRepoDto = {
      originalFileName,
      ownerId: userId,
      size: payload.size,
      mimeType: payload.mimeType,
      status: FileStatus.PENDING,
      storageKey,
      bucket: this.bucketName,
      parentFolderId: parentFolderId || null,
      permissions: [],
    };

    const file = await this.fileRepository.create(dto);

    this.logger.log(`Initialized upload for file ${file._id} (User: ${userId})`);

    return { uploadUrl, file };
  }

  async confirmUpload(payload: ConfirmUploadPayload) {
    const { userId, fileId, success } = payload;

    // Just verify ownership
    await this.aclService.validateAccess(fileId, userId, ResourceType.FILE, AccessLevel.OWNER);

    if (success) {
      this.logger.log(`File ${fileId} confirmed successfully by user ${userId}`);
      return this.fileRepository.updateStatus(fileId, FileStatus.UPLOADED);
    } else {
      this.logger.warn(`File ${fileId} upload failed or cancelled by user ${userId}. Deleting metadata.`);
      await this.fileRepository.delete(fileId);
      return { status: 'deleted' };
    }
  }

  async delete(payload: DeleteResourcePayload) {
    await this.aclService.validateAccess(payload.resourceId, payload.userId, ResourceType.FILE, AccessLevel.OWNER);
    await this.fileRepository.delete(payload.resourceId);

    this.logger.log(`Deleted file ${payload.resourceId} (User: ${payload.userId})`);

    return { success: true, id: payload.resourceId };
  }

  async getDownloadUrl(payload: GetDownloadUrlPayload) {
    const file = (await this.aclService.validateAccess(
      payload.resourceId,
      payload.userId,
      ResourceType.FILE,
      AccessLevel.VIEWER
    )) as FileEntity;
    return this.storageService.getPresignedGetUrl(file.storageKey);
  }
}
