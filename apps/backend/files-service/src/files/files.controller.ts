import {
  ConfirmUploadPayload,
  CreateFolderPayload,
  DeleteResourcePayload,
  FILES_PATTERNS,
  GetContentPayload,
  GetDownloadUrlPayload,
  InitializeUploadPayload,
  ShareResourcePayload,
  UnshareResourcePayload,
} from '@LucidRF/files-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileService, FolderService } from './application';
import { SharingService } from './application/sharing.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly fileService: FileService,
    private readonly folderService: FolderService,
    private readonly sharingService: SharingService
  ) {}

  // --- File Lifecycle ---
  @MessagePattern(FILES_PATTERNS.INIT_UPLOAD)
  async initializeUpload(@Payload() payload: InitializeUploadPayload) {
    return this.fileService.initializeUpload(payload);
  }

  @MessagePattern(FILES_PATTERNS.CONFIRM_UPLOAD)
  async confirmUpload(@Payload() payload: ConfirmUploadPayload) {
    return this.fileService.confirmUpload(payload);
  }

  @MessagePattern(FILES_PATTERNS.DELETE_FILE)
  async deleteFile(@Payload() payload: DeleteResourcePayload) {
    return this.fileService.delete(payload);
  }

  @MessagePattern(FILES_PATTERNS.GET_DOWNLOAD_URL)
  async getDownloadUrl(@Payload() payload: GetDownloadUrlPayload) {
    return this.fileService.getDownloadUrl(payload);
  }

  // --- Folder Management ---
  @MessagePattern(FILES_PATTERNS.CREATE_FOLDER)
  async createFolder(@Payload() payload: CreateFolderPayload) {
    return this.folderService.create(payload);
  }

  @MessagePattern(FILES_PATTERNS.LIST_CONTENT)
  async listContent(@Payload() payload: GetContentPayload) {
    return this.folderService.listContent(payload);
  }

  @MessagePattern(FILES_PATTERNS.GET_SHARED_FILES)
  async getSharedWithMe(@Payload() userId: string) {
    return this.fileService.getSharedWithMe(userId);
  }

  @MessagePattern(FILES_PATTERNS.DELETE_FOLDER)
  async deleteFolder(@Payload() payload: DeleteResourcePayload) {
    return this.folderService.delete(payload);
  }

  // --- Access Control ---
  @MessagePattern(FILES_PATTERNS.SHARE_FILE)
  async shareFile(@Payload() payload: ShareResourcePayload) {
    return this.sharingService.shareFile(payload);
  }

  @MessagePattern(FILES_PATTERNS.UNSHARE_FILE)
  async unshareFile(@Payload() payload: UnshareResourcePayload) {
    return this.sharingService.unshareFile(payload);
  }

  @MessagePattern(FILES_PATTERNS.SHARE_FOLDER)
  async shareFolder(@Payload() payload: ShareResourcePayload) {
    return this.sharingService.shareFolder(payload);
  }

  @MessagePattern(FILES_PATTERNS.UNSHARE_FOLDER)
  async unshareFolder(@Payload() payload: UnshareResourcePayload) {
    return this.sharingService.unshareFolder(payload);
  }
}
