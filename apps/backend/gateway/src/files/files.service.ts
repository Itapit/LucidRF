import {
  ConfirmUploadPayload,
  CreateFolderPayload,
  DeleteResourcePayload,
  FILES_PATTERNS,
  FILES_SERVICE,
  GetContentPayload,
  GetDownloadUrlPayload,
  InitializeUploadPayload,
  ShareResourcePayload,
  UnshareResourcePayload,
} from '@LucidRF/files-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ConfirmUploadDto,
  CreateFolderDto,
  DeleteResourceDto,
  GetDownloadUrlDto,
  InitUploadDto,
  ShareResourceDto,
  UnshareResourceDto,
} from './dtos';

@Injectable()
export class FilesService {
  constructor(@Inject(FILES_SERVICE) private readonly filesClient: ClientProxy) {}

  initUpload(dto: InitUploadDto, userId: string) {
    const payload: InitializeUploadPayload = {
      originalFileName: dto.originalFileName,
      size: dto.size,
      mimeType: dto.mimeType,
      parentFolderId: dto.parentFolderId ?? null, // Contract expects string | null
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
      parentFolderId: dto.parentFolderId ?? null,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.CREATE_FOLDER, payload);
  }

  listContent(folderId: string | undefined, userId: string) {
    const payload: GetContentPayload = {
      folderId: folderId ?? null, // Contract expects string | null
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

  // =================================================================================================
  //  Sharing / ACL
  // =================================================================================================

  async getSharedWithMe(userId: string) {
    return this.filesClient.send(FILES_PATTERNS.GET_SHARED_FILES, userId);
  }

  shareFile(dto: ShareResourceDto, userId: string) {
    const payload: ShareResourcePayload = {
      resourceId: dto.resourceId,
      subjectId: dto.subjectId,
      subjectType: dto.subjectType,
      role: dto.role,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.SHARE_FILE, payload);
  }

  shareFolder(dto: ShareResourceDto, userId: string) {
    const payload: ShareResourcePayload = {
      resourceId: dto.resourceId,
      subjectId: dto.subjectId,
      subjectType: dto.subjectType,
      role: dto.role,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.SHARE_FOLDER, payload);
  }

  unshareFile(dto: UnshareResourceDto, userId: string) {
    const payload: UnshareResourcePayload = {
      resourceId: dto.resourceId,
      subjectId: dto.subjectId,
      subjectType: dto.subjectType,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.UNSHARE_FILE, payload);
  }

  unshareFolder(dto: UnshareResourceDto, userId: string) {
    const payload: UnshareResourcePayload = {
      resourceId: dto.resourceId,
      subjectId: dto.subjectId,
      subjectType: dto.subjectType,
      userId,
    };
    return this.filesClient.send(FILES_PATTERNS.UNSHARE_FOLDER, payload);
  }
}
