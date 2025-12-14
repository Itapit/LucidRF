import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from '../storage/storage.module';
import { FileRepository } from './domain/file.repository';
import { FolderRepository } from './domain/folder.repository';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MongoFileRepository } from './infrastructure/mongo-file.repository';
import { FileSchema, FileSchemaFactory } from './infrastructure/schemas/file.schema';
import { FolderSchema, FolderSchemaFactory } from './infrastructure/schemas/folder.schema';
import { AclService } from './services/acl.service';
import { FileService } from './services/file.service';
import { FolderService } from './services/folder.service';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    MongooseModule.forFeature([
      { name: FileSchema.name, schema: FileSchemaFactory },
      { name: FolderSchema.name, schema: FolderSchemaFactory },
    ]),
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    FileService,
    FolderService,
    AclService,
    {
      provide: FileRepository,
      useClass: MongoFileRepository,
    },
    {
      provide: FolderRepository,
      useClass: MongoFileRepository,
    },
  ],
})
export class FilesModule {}
