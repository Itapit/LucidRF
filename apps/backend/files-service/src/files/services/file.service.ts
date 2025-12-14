import { FileStatus } from '@limbo/common';
import { ConfirmUploadPayload, DeleteResourcePayload, InitializeUploadPayload } from '@limbo/files-contracts';
import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../../storage/storage.service';
import { CreateFileRepoDto } from '../domain/dtos/create-file-repo.dto';
import { FileRepository } from '../domain/file.repository';
import { FolderRepository } from '../domain/folder.repository';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly bucketName: string;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService
  ) {
    this.bucketName = this.configService.get<string>('FILES_BUCKET');
  }

  async initializeUpload(payload: InitializeUploadPayload) {
    const { userId, originalFileName, parentFolderId } = payload;

    if (parentFolderId) {
      const parent = await this.folderRepository.findById(parentFolderId);
      if (!parent || parent.ownerId !== userId) throw new NotFoundException('Parent folder invalid');
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

    // Just verify ownership, no need to assign return value if unused
    await this.verifyOwner(fileId, userId);

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
    await this.verifyOwner(payload.id, payload.userId);
    await this.fileRepository.delete(payload.id);

    this.logger.log(`Deleted file ${payload.id} (User: ${payload.userId})`);

    return { success: true, id: payload.id };
  }

  async getDownloadUrl(fileId: string, userId: string) {
    const file = await this.verifyOwner(fileId, userId);
    return this.storageService.getPresignedGetUrl(file.storageKey);
  }

  async verifyOwner(fileId: string, userId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId !== userId) throw new UnauthorizedException('Access denied');
    return file;
  }
}
