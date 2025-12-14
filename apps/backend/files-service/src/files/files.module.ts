import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from '../storage/storage.module';
import { FileRepository } from './domain/file.repository';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MongoFileRepository } from './infrastructure/mongo-file.repository';
import { FileSchema, FileSchemaFactory } from './infrastructure/schemas/file.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: FileSchema.name, schema: FileSchemaFactory }]), StorageModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: FileRepository,
      useClass: MongoFileRepository,
    },
  ],
})
export class FilesModule {}
