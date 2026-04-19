import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { StorageService } from './interfaces';
import { MinioStorageService } from './minio-storage.service';
import { INTERNAL_MINIO_CLIENT, MINIO_CLIENT, STORAGE_BUCKET_NAME } from './storage.constants';

@Module({
  providers: [
    {
      provide: MINIO_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Minio.Client({
          endPoint: configService.getOrThrow('MINIO_ENDPOINT'),
          port: parseInt(configService.getOrThrow('MINIO_PORT'), 10),
          useSSL: configService.get('MINIO_USE_SSL') === 'true',
          accessKey: configService.getOrThrow('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow('MINIO_SECRET_KEY'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: INTERNAL_MINIO_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Minio.Client({
          endPoint: configService.getOrThrow('INTERNAL_MINIO_ENDPOINT'),
          port: parseInt(configService.getOrThrow('MINIO_PORT'), 10),
          useSSL: configService.get('MINIO_USE_SSL') === 'true',
          accessKey: configService.getOrThrow('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow('MINIO_SECRET_KEY'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: STORAGE_BUCKET_NAME,
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow('MINIO_BUCKET_NAME');
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
