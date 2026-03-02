import {
  ConfirmUploadPayload,
  CreateFolderPayload,
  DeleteResourcePayload,
  FILES_PATTERNS,
  FILES_SERVICE,
  GetContentPayload,
  GetDownloadUrlPayload,
  InitializeUploadPayload,
} from '@LucidRF/files-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfirmUploadDto, CreateFolderDto, DeleteResourceDto, GetDownloadUrlDto, InitUploadDto } from './dtos';

@Injectable()
export class FilesService {
  constructor(@Inject(FILES_SERVICE) private readonly filesClient: ClientProxy) {}

  initUpload(dto: InitUploadDto, userId: string) {
    const payload: InitializeUploadPayload = {
      originalFileName: dto.originalFileName,
      size: dto.size,
      mimeType: dto.mimeType,
      teamId: dto.teamId,
      parentFolderId: dto.parentFolderId ?? null,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.INIT_UPLOAD, payload);
  }

  confirmUpload(dto: ConfirmUploadDto, userId: string) {
    const payload: ConfirmUploadPayload = {
      fileId: dto.fileId,
      success: dto.success,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.CONFIRM_UPLOAD, payload);
  }

  getDownloadUrl(dto: GetDownloadUrlDto, userId: string) {
    const payload: GetDownloadUrlPayload = {
      resourceId: dto.resourceId,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.GET_DOWNLOAD_URL, payload);
  }

  deleteFile(dto: DeleteResourceDto, userId: string) {
    const payload: DeleteResourcePayload = {
      resourceId: dto.resourceId,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.DELETE_FILE, payload);
  }

  // =================================================================================================
  //  Folder Operations
  // =================================================================================================

  createFolder(dto: CreateFolderDto, userId: string) {
    const payload: CreateFolderPayload = {
      name: dto.name,
      teamId: dto.teamId,
      parentFolderId: dto.parentFolderId ?? null,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.CREATE_FOLDER, payload);
  }

  listContent(teamId: string, folderId: string | undefined, userId: string) {
    const payload: GetContentPayload = {
      teamId,
      folderId: folderId ?? null,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.LIST_CONTENT, payload);
  }

  deleteFolder(dto: DeleteResourceDto, userId: string) {
    const payload: DeleteResourcePayload = {
      resourceId: dto.resourceId,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.DELETE_FOLDER, payload);
  }
}
