import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { MinioStorageService } from './minio-storage.service';
import { MINIO_CLIENT, STORAGE_BUCKET_NAME } from './storage.constants';
import { StorageService } from './storage.service';

@Module({
  providers: [
    {
      provide: MINIO_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Minio.Client({
          endPoint: configService.getOrThrow<string>('MINIO_ENDPOINT'),
          port: parseInt(configService.getOrThrow<string>('MINIO_PORT'), 10),
          useSSL: configService.get<string>('MINIO_USE_SSL') === 'true',
          accessKey: configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow<string>('MINIO_SECRET_KEY'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: STORAGE_BUCKET_NAME,
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow<string>('MINIO_BUCKET_NAME');
      },
      inject: [ConfigService],
    },
    {
      provide: StorageService,
      useClass: MinioStorageService,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
