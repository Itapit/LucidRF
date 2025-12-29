import { FileStatus } from '@LucidRF/common';
import {
  ConfirmUploadPayload,
  DeleteResourcePayload,
  GetDownloadUrlPayload,
  InitializeUploadPayload,
} from '@LucidRF/files-contracts';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageUploadException } from '../../storage/exceptions';
import { StorageService } from '../../storage/interfaces';
import { STORAGE_BUCKET_NAME } from '../../storage/storage.constants';
import { CreateFileRepoDto } from '../domain/dtos';
import { FileEntity, FolderEntity, PermissionEntity, toFileDto } from '../domain/entities';
import { AccessLevel, ResourceType } from '../domain/enums';
import { ResourceNotFoundException } from '../domain/exceptions';
import { FileRepository, FolderRepository, GroupsService } from '../domain/interfaces';
import { calculateInheritedPermissions, filterTopLevelSharedItems } from '../domain/logic';
import { AclService } from './acl.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository,
    private readonly storageService: StorageService,
    private readonly aclService: AclService,
    private readonly groupsService: GroupsService,
    @Inject(STORAGE_BUCKET_NAME) private readonly bucketName: string
  ) {}

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

    const file = (await this.aclService.validateAccess(
      fileId,
      userId,
      ResourceType.FILE,
      AccessLevel.OWNER
    )) as FileEntity;

    if (success) {
      return this.handleFailedUpload(file);
    } else {
      return this.handleSuccessfulUpload(file);
    }
  }

  async delete(payload: DeleteResourcePayload) {
    await this.aclService.validateAccess(payload.resourceId, payload.userId, ResourceType.FILE, AccessLevel.OWNER);
    const deleted = await this.fileRepository.delete(payload.resourceId);
    if (!deleted) {
      throw new ResourceNotFoundException(payload.resourceId);
    }
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

  /**
   * Returns "Shared With Me" items, showing only the highest-level shared roots.
   */
  async getSharedWithMe(userId: string): Promise<{ files: FileEntity[]; folders: FolderEntity[] }> {
    const groupIds = await this.groupsService.getUserGroupIds(userId);

    const [rawFiles, rawFolders] = await Promise.all([
      this.fileRepository.findSharedWith(userId, groupIds),
      this.folderRepository.findSharedWith(userId, groupIds),
    ]);

    return filterTopLevelSharedItems(rawFiles, rawFolders);
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

  private async handleSuccessfulUpload(file: FileEntity) {
    const exists = await this.storageService.fileExists(file.storageKey);

    if (!exists) {
      this.logger.warn(`Security Alert: File ${file._id} missing in storage.`);
      // If it's not there, we treat it as a failed upload and clean up
      await this.handleFailedUpload(file);
      throw new StorageUploadException(file._id, 'File missing in storage after upload confirmation.');
    }

    const updatedFile = await this.fileRepository.updateStatus(file._id, FileStatus.UPLOADED);
    if (!updatedFile) {
      throw new ResourceNotFoundException(file._id);
    }

    return toFileDto(updatedFile);
  }
  private async handleFailedUpload(file: FileEntity) {
    this.logger.warn(`Cleaning up failed upload for file ${file._id}`);

    await this.fileRepository.delete(file._id);

    // Ensure Storage is Clean (Best Effort)
    // We swallow errors here because if the file doesn't exist, that's actually good.
    try {
      await this.storageService.delete(file.storageKey);
    } catch (error) {
      this.logger.debug(`Storage cleanup note: ${error.message}`);
    }

    return { status: 'deleted' };
  }
}
