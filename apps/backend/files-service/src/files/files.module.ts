import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from '../storage/storage.module';
import { FileRepository, FolderRepository } from './domain/repositories';
import { TransactionManager } from './domain/transaction.manager';
import { FilesController } from './files.controller';
import { DatabaseContext } from './infrastructure/persistence/database.context';
import { MongoTransactionManager } from './infrastructure/persistence/mongo-transaction.manager';
import { MongoFileRepository, MongoFolderRepository } from './infrastructure/repositories';
import { FileSchema, FileSchemaFactory, FolderSchema, FolderSchemaFactory } from './infrastructure/schemas';
import { AclService, FileService, FolderService, PermissionPropagationService, SharingService } from './services';

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
    SharingService,
    FileService,
    FolderService,
    AclService,
    PermissionPropagationService,
    DatabaseContext,
    {
      provide: TransactionManager,
      useClass: MongoTransactionManager,
    },
    {
      provide: FileRepository,
      useClass: MongoFileRepository,
    },
    {
      provide: FolderRepository,
      useClass: MongoFolderRepository,
    },
  ],
})
export class FilesModule {}
