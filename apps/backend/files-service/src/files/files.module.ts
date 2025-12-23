import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsIntegrationModule } from '../integrations/groups/groups-integration.module';
import { TcpGroupsService } from '../integrations/groups/tcp-groups.service';
import { STORAGE_BUCKET_NAME } from '../storage/storage.constants';
import { StorageModule } from '../storage/storage.module';
import { AclService, FileService, FolderService, PermissionPropagationService, SharingService } from './application';
import { FileRepository, FolderRepository, GroupsService } from './domain/interfaces';
import { TransactionManager } from './domain/transaction.manager';
import { FilesController } from './files.controller';
import { DatabaseContext } from './infrastructure/persistence/database.context';
import { MongoTransactionManager } from './infrastructure/persistence/mongo-transaction.manager';
import { MongoFileRepository, MongoFolderRepository } from './infrastructure/repositories';
import { FileSchema, FileSchemaFactory, FolderSchema, FolderSchemaFactory } from './infrastructure/schemas';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    MongooseModule.forFeature([
      { name: FileSchema.name, schema: FileSchemaFactory },
      { name: FolderSchema.name, schema: FolderSchemaFactory },
    ]),
    GroupsIntegrationModule,
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
    {
      provide: GroupsService,
      useExisting: TcpGroupsService,
    },
    {
      provide: STORAGE_BUCKET_NAME,
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow<string>('MINIO_BUCKET_NAME');
      },
      inject: [ConfigService],
    },
  ],
})
export class FilesModule {}
