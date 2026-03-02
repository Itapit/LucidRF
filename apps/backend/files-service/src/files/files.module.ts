import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TcpTeamsService } from '../integrations/teams/tcp-teams.service';
import { TeamsIntegrationModule } from '../integrations/teams/teams-integration.module';
import { STORAGE_BUCKET_NAME } from '../storage/storage.constants';
import { StorageModule } from '../storage/storage.module';
import { FileService, FolderService } from './application';
import { FileRepository, FolderRepository, TeamsService } from './domain/interfaces';
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
    TeamsIntegrationModule,
  ],
  controllers: [FilesController],
  providers: [
    FileService,
    FolderService,
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
      provide: TeamsService,
      useExisting: TcpTeamsService,
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
