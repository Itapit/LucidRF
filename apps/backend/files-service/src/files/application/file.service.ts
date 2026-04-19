import { FileMetadata, FileStatus, FileUploadedEvent } from '@LucidRF/common';
import {
  ConfirmUploadPayload,
  DeleteResourcePayload,
  DeleteTeamFilesPayload,
  GetDownloadUrlPayload,
  InitializeUploadPayload,
} from '@LucidRF/files-contracts';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { basename } from 'path';
import { StorageUploadException } from '../../storage/exceptions';
import { StorageService } from '../../storage/interfaces';
import { STORAGE_BUCKET_NAME } from '../../storage/storage.constants';
import { CreateFileRepoDto } from '../domain/dtos';
import { FileEntity, toFileDto } from '../domain/entities';
import { ResourceNotFoundException, UserDoesntHaveAccessToTeamException } from '../domain/exceptions';
import { FileRepository, FolderRepository, TeamsService } from '../domain/interfaces';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository,
    private readonly storageService: StorageService,
    private readonly teamsService: TeamsService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(STORAGE_BUCKET_NAME) private readonly bucketName: string
  ) {}

  async initializeUpload(payload: InitializeUploadPayload) {
    const { userId, teamId, originalFileName, parentFolderId } = payload;

    await this.validateTeamAccess(userId, teamId);

    if (parentFolderId) {
      const parent = await this.folderRepository.findById(parentFolderId);
      if (!parent || parent.teamId !== teamId) {
        throw new ResourceNotFoundException(parentFolderId);
      }
    }

    const { storageKey, uploadUrl } = await this.generateStorageDetails(userId, originalFileName);

    const file = await this.createFileRecord(payload, storageKey);

    this.logger.log(`Initialized upload for file ${file.id} (User: ${userId}, Team: ${teamId})`);
    return {
      uploadUrl,
      file: toFileDto(file),
    };
  }

  async confirmUpload(payload: ConfirmUploadPayload) {
    const { userId, fileId, success } = payload;

    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new ResourceNotFoundException(fileId);

    await this.validateTeamAccess(userId, file.teamId);

    if (!success) {
      return this.handleFailedUpload(file);
    } else {
      return this.handleSuccessfulUpload(file);
    }
  }

  async delete(payload: DeleteResourcePayload) {
    const file = await this.fileRepository.findById(payload.resourceId);
    if (!file) throw new ResourceNotFoundException(payload.resourceId);

    await this.validateTeamAccess(payload.userId, file.teamId);

    const deleted = await this.fileRepository.delete(payload.resourceId);
    if (!deleted) {
      throw new ResourceNotFoundException(payload.resourceId);
    }

    // Cleanup storage asynchronously
    this.storageService.delete(file.storageKey).catch((e) => {
      this.logger.error(`Failed to delete storage file ${file.storageKey}`, e);
    });

    this.logger.log(`Deleted file ${payload.resourceId} (User: ${payload.userId})`);

    return { success: true, id: payload.resourceId };
  }

  async deleteTeamFiles(payload: DeleteTeamFilesPayload) {
    const { teamId } = payload;
    this.logger.log(`Deleting all files and folders for team ${teamId}`);

    const files = await this.fileRepository.findByTeamIdSystem(teamId);
    const storageKeys = files.map((f) => f.storageKey);

    if (storageKeys.length > 0) {
      await this.storageService.deleteMany(storageKeys);
    }

    await this.fileRepository.deleteManyByTeamId(teamId);
    await this.folderRepository.deleteManyByTeamId(teamId);

    return { success: true };
  }

  async getDownloadUrl(payload: GetDownloadUrlPayload) {
    const file = await this.fileRepository.findById(payload.resourceId);
    if (!file) throw new ResourceNotFoundException(payload.resourceId);

    await this.validateTeamAccess(payload.userId, file.teamId);

    return this.storageService.getPresignedGetUrl(file.storageKey);
  }

  async updateFileMetadata(fileId: string, metadata: FileMetadata, status: FileStatus) {
    // Validate file exists
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new ResourceNotFoundException(fileId);

    // Update repository
    const updatedFile = await this.fileRepository.updateMetadata(fileId, metadata, status);
    if (!updatedFile) {
      throw new ResourceNotFoundException(fileId);
    }

    this.logger.log(`Updated metadata and status to ${status} for file ${fileId}`);

    return toFileDto(updatedFile);
  }

  // =================================================================================================
  //  Helpers
  // =================================================================================================

  private async validateTeamAccess(userId: string, teamId: string): Promise<void> {
    const teamIds = await this.teamsService.getUserTeamIds(userId);
    if (!teamIds.includes(teamId)) {
      throw new UserDoesntHaveAccessToTeamException(userId, teamId);
    }
  }

  /**
   * Handles the generation of unique storage keys and presigned URLs.
   */
  private async generateStorageDetails(userId: string, fileName: string) {
    const uniqueSuffix = randomUUID();
    const safeFileName = basename(fileName);
    const storageKey = `uploads/${userId}/${uniqueSuffix}-${safeFileName}`;
    const uploadUrl = await this.storageService.getPresignedPutUrl(storageKey);

    return { storageKey, uploadUrl };
  }

  /**
   * Creates the database record.
   */
  private async createFileRecord(payload: InitializeUploadPayload, storageKey: string) {
    const dto: CreateFileRepoDto = {
      originalFileName: payload.originalFileName,
      teamId: payload.teamId,
      size: payload.size,
      mimeType: payload.mimeType,
      status: FileStatus.PENDING,
      storageKey,
      bucket: this.bucketName,
      parentFolderId: payload.parentFolderId || null,
      uploadedBy: payload.userId,
    };

    return this.fileRepository.create(dto);
  }

  private async handleSuccessfulUpload(file: FileEntity) {
    const exists = await this.storageService.fileExists(file.storageKey);

    if (!exists) {
      this.logger.warn(`Security Alert: File ${file.id} missing in storage.`);
      // If it's not there, we treat it as a failed upload and clean up
      await this.handleFailedUpload(file);
      throw new StorageUploadException(file.id, 'File missing in storage after upload confirmation.');
    }

    const updatedFile = await this.fileRepository.updateStatus(file.id, FileStatus.UPLOADED);
    if (!updatedFile) {
      throw new ResourceNotFoundException(file.id);
    }

    const dto = toFileDto(updatedFile);
    this.eventEmitter.emit('file.uploaded', new FileUploadedEvent(dto));

    return dto;
  }

  private async handleFailedUpload(file: FileEntity) {
    this.logger.warn(`Cleaning up failed upload for file ${file.id}`);

    await this.fileRepository.delete(file.id);

    // Ensure Storage is Clean (Best Effort)
    try {
      await this.storageService.delete(file.storageKey);
    } catch (error: any) {
      this.logger.debug(`Storage cleanup note: ${error.message}`);
    }

    return { status: 'deleted' };
  }
}
