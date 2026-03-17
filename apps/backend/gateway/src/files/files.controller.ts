import { FolderDto } from '@LucidRF/common';
import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessAuthenticatedRequest } from '../auth/types/access-jwt.types';
import {
  ConfirmUploadDto,
  ConfirmUploadResponseDto,
  CreateFolderDto,
  DeleteResourceDto,
  DeleteResourceResponseDto,
  GetDownloadUrlDto,
  GetDownloadUrlResponseDto,
  InitUploadDto,
  InitUploadResponseDto,
  ListContentDto,
  ListContentResponseDto,
} from './dtos';
import { FilesService } from './files.service';

/**
 * Controller for file and folder management.
 * Handles file uploads, downloads, and directory organization within teams.
 */
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  // =================================================================================================
  //  File Lifecycle
  // =================================================================================================

  /**
   * Initialize file upload
   * Starts the process and returns S3 instructions for the client.
   * @param dto Upload details including filename and size.
   * @param req Authenticated user request.
   */
  @Post('init-upload')
  async initUpload(@Body() dto: InitUploadDto, @Req() req: AccessAuthenticatedRequest): Promise<InitUploadResponseDto> {
    return firstValueFrom(this.filesService.initUpload(dto, req.user.userId));
  }

  /**
   * Confirm upload status
   * Notifies the system that an upload completed and registers the file.
   * @param dto Confirmation details including resource ID.
   * @param req Authenticated user request.
   */
  @Post('confirm-upload')
  async confirmUpload(
    @Body() dto: ConfirmUploadDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<ConfirmUploadResponseDto> {
    return firstValueFrom(this.filesService.confirmUpload(dto, req.user.userId));
  }

  /**
   * Get file download URL
   * Generates a temporary link for a specific file resource.
   * @param params Resource ID of the file.
   * @param req Authenticated user request.
   */
  @Get('download/:resourceId')
  async getDownloadUrl(
    @Param() params: GetDownloadUrlDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<GetDownloadUrlResponseDto> {
    return firstValueFrom(this.filesService.getDownloadUrl(params, req.user.userId));
  }

  /**
   * Delete file resource
   * Permanently removes a file and its metadata.
   * @param params Resource ID of the file to delete.
   * @param req Authenticated user request.
   */
  @Delete('file/:resourceId')
  async deleteFile(
    @Param() params: DeleteResourceDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<DeleteResourceResponseDto> {
    return firstValueFrom(this.filesService.deleteFile(params, req.user.userId));
  }

  // =================================================================================================
  //  Folder Management
  // =================================================================================================

  /**
   * Create new folder
   * Initializes a directory within a team storage.
   * @param dto Folder details including name and parent ID.
   * @param req Authenticated user request.
   */
  @Post('folder')
  async createFolder(@Body() dto: CreateFolderDto, @Req() req: AccessAuthenticatedRequest): Promise<FolderDto> {
    return firstValueFrom(this.filesService.createFolder(dto, req.user.userId));
  }

  /**
   * List folder content
   * Retrieves items within a specific directory or the team root.
   * @param query Filtering options including team ID and folder ID.
   * @param req Authenticated user request.
   */
  @Get('content')
  async listContent(
    @Query() query: ListContentDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<ListContentResponseDto> {
    return firstValueFrom(this.filesService.listContent(query.teamId, query.folderId, req.user.userId));
  }

  /**
   * Delete folder content
   * Recursively removes a folder and everything inside it.
   * @param params Resource ID of the folder to delete.
   * @param req Authenticated user request.
   */
  @Delete('folder/:resourceId')
  async deleteFolder(
    @Param() params: DeleteResourceDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<DeleteResourceResponseDto> {
    return firstValueFrom(this.filesService.deleteFolder(params, req.user.userId));
  }
}
