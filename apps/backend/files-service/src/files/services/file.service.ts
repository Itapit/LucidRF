import { FileStatus } from '@LucidRF/common';
import {
  ConfirmUploadPayload,
  DeleteResourcePayload,
  GetDownloadUrlPayload,
  InitializeUploadPayload,
} from '@LucidRF/files-contracts';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../../storage/storage.service';
import { CreateFileRepoDto } from '../domain/dtos';
import { FileEntity, FolderEntity, PermissionEntity, toFileDto } from '../domain/entities';
import { AccessLevel, ResourceType } from '../domain/enums';
import { calculateInheritedPermissions } from '../domain/logic/permission.logic';
import { FileRepository } from '../domain/repositories';
import { AclService } from './acl.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly bucketName: string;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly storageService: StorageService,
    private readonly aclService: AclService,
    private readonly configService: ConfigService
  ) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');
  }

  async initializeUpload(payload: InitializeUploadPayload) {
    const { userId, originalFileName, parentFolderId } = payload;

    const initialPermissions = await this.resolveInitialPermissions(parentFolderId, userId);

    const { storageKey, uploadUrl } = await this.generateStorageDetails(userId, originalFileName);

    const file = await this.createFileRecord(payload, storageKey, initialPermissions);

    this.logger.log(`Initialized upload for file ${file._id} (User: ${userId})`);
    return {
      uploadUrl,
      file: toFileDto(file),
    };
  }

  async confirmUpload(payload: ConfirmUploadPayload) {
    const { userId, fileId, success } = payload;

    // Just verify ownership
    await this.aclService.validateAccess(fileId, userId, ResourceType.FILE, AccessLevel.OWNER);

    if (success) {
      this.logger.log(`File ${fileId} confirmed successfully by user ${userId}`);
      const file = await this.fileRepository.updateStatus(fileId, FileStatus.UPLOADED);
      return toFileDto(file);
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

  // =================================================================================================
  //  Helpers
  // =================================================================================================

  /**
   * Validates access to the parent folder and returns the permissions
   * that the new file should inherit.
   */
  private async resolveInitialPermissions(
    parentFolderId: string | undefined,
    userId: string
  ): Promise<PermissionEntity[]> {
    if (!parentFolderId) return [];

    // Validate Access (User must be OWNER/EDITOR of the parent)
    const parentFolder = (await this.aclService.validateAccess(
      parentFolderId,
      userId,
      ResourceType.FOLDER,
      AccessLevel.EDITOR
    )) as FolderEntity;

    return calculateInheritedPermissions(parentFolder, userId);
  }

  /**
   * Handles the generation of unique storage keys and presigned URLs.
   */
  private async generateStorageDetails(userId: string, fileName: string) {
    const uniqueSuffix = uuidv4();
    const storageKey = `uploads/${userId}/${uniqueSuffix}-${fileName}`;
    const uploadUrl = await this.storageService.getPresignedPutUrl(storageKey);

    return { storageKey, uploadUrl };
  }

  /**
   * Creates the database record.
   */
  private async createFileRecord(
    payload: InitializeUploadPayload,
    storageKey: string,
    permissions: PermissionEntity[]
  ) {
    const dto: CreateFileRepoDto = {
      originalFileName: payload.originalFileName,
      ownerId: payload.userId,
      size: payload.size,
      mimeType: payload.mimeType,
      status: FileStatus.PENDING,
      storageKey,
      bucket: this.bucketName,
      parentFolderId: payload.parentFolderId || null,
      permissions,
    };

    return this.fileRepository.create(dto);
  }
}
