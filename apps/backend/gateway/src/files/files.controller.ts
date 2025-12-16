import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessAuthenticatedRequest } from '../auth/types/access-jwt.types';
import {
  ConfirmUploadDto,
  CreateFolderDto,
  DeleteResourceDto,
  GetDownloadUrlDto,
  InitUploadDto,
  ListContentDto,
  ShareResourceDto,
  UnshareResourceDto,
} from './dtos';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  // =================================================================================================
  //  File Lifecycle
  // =================================================================================================

  @Post('init-upload')
  async initUpload(@Body() dto: InitUploadDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.initUpload(dto, req.user.userId);
  }

  @Post('confirm-upload')
  async confirmUpload(@Body() dto: ConfirmUploadDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.confirmUpload(dto, req.user.userId);
  }

  @Get('download/:resourceId')
  async getDownloadUrl(@Param() params: GetDownloadUrlDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.getDownloadUrl(params, req.user.userId);
  }

  @Delete('file/:resourceId')
  async deleteFile(@Param() params: DeleteResourceDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.deleteFile(params, req.user.userId);
  }

  // =================================================================================================
  //  Folder Management
  // =================================================================================================

  @Post('folder')
  async createFolder(@Body() dto: CreateFolderDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.createFolder(dto, req.user.userId);
  }

  @Get('content')
  async listContent(@Query() query: ListContentDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.listContent(query.folderId, req.user.userId);
  }

  @Delete('folder/:resourceId')
  async deleteFolder(@Param() params: DeleteResourceDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.deleteFolder(params, req.user.userId);
  }

  // =================================================================================================
  //  Sharing / ACL
  // =================================================================================================

  @Post('file/share')
  async shareFile(@Body() dto: ShareResourceDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.shareFile(dto, req.user.userId);
  }

  @Post('folder/share')
  async shareFolder(@Body() dto: ShareResourceDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.shareFolder(dto, req.user.userId);
  }

  @Post('file/unshare')
  async unshareFile(@Body() dto: UnshareResourceDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.unshareFile(dto, req.user.userId);
  }

  @Post('folder/unshare')
  async unshareFolder(@Body() dto: UnshareResourceDto, @Req() req: AccessAuthenticatedRequest) {
    return this.filesService.unshareFolder(dto, req.user.userId);
  }
}
