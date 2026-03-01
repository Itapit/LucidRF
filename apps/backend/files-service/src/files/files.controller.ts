import {
  ConfirmUploadPayload,
  CreateFolderPayload,
  DeleteResourcePayload,
  FILES_PATTERNS,
  GetContentPayload,
  GetDownloadUrlPayload,
  InitializeUploadPayload,
} from '@LucidRF/files-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileService, FolderService } from './application';

@Controller('files')
export class FilesController {
  constructor(private readonly fileService: FileService, private readonly folderService: FolderService) {}

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

  @MessagePattern(FILES_PATTERNS.DELETE_FOLDER)
  async deleteFolder(@Payload() payload: DeleteResourcePayload) {
    return this.folderService.delete(payload);
  }
}
