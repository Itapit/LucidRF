import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { StorageConnectionException, StorageDeleteException, StorageUploadException } from './exceptions';
import { StorageService } from './interfaces/storage.service.interface';
import { MinioError } from './interfaces/minio-error.interface';
import { DEFAULT_PRESIGNED_URL_EXPIRY, MINIO_CLIENT, INTERNAL_MINIO_CLIENT, STORAGE_BUCKET_NAME } from './storage.constants';

@Injectable()
export class MinioStorageService implements StorageService, OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);

  constructor(
    @Inject(MINIO_CLIENT) private readonly minioClient: Minio.Client,
    @Inject(INTERNAL_MINIO_CLIENT) private readonly internalMinioClient: Minio.Client,
    @Inject(STORAGE_BUCKET_NAME) private readonly bucketName: string
  ) {}

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
        this.logger.log(`Bucket '${this.bucketName}' created successfully.`);
      }
    } catch (e) {
      const error = e as MinioError;
      this.logger.error(`Failed to verify/create bucket '${this.bucketName}': ${error.message}`);
      throw new StorageConnectionException('MinIO', error.message);
    }
  }

  async getPresignedPutUrl(key: string, expiry = DEFAULT_PRESIGNED_URL_EXPIRY): Promise<string> {
    try {
      return await this.minioClient.presignedPutObject(this.bucketName, key, expiry);
    } catch (e) {
      const error = e as MinioError;
      this.logger.error(`Error generating PUT URL for ${key}: ${error.message}`);
      throw new StorageUploadException(key, error.message);
    }
  }

  async getPresignedGetUrl(key: string, expiry = DEFAULT_PRESIGNED_URL_EXPIRY): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, key, expiry);
    } catch (e) {
      const error = e as MinioError;
      this.logger.error(`Error generating GET URL for ${key}: ${error.message}`);
      throw new StorageUploadException(key, error.message);
    }
  }

  async getInternalPresignedPutUrl(key: string, expiry = DEFAULT_PRESIGNED_URL_EXPIRY): Promise<string> {
    try {
      return await this.internalMinioClient.presignedPutObject(this.bucketName, key, expiry);
    } catch (e) {
      const error = e as MinioError;
      this.logger.error(`Error generating internal PUT URL for ${key}: ${error.message}`);
      throw new StorageUploadException(key, error.message);
    }
  }

  async getInternalPresignedGetUrl(key: string, expiry = DEFAULT_PRESIGNED_URL_EXPIRY): Promise<string> {
    try {
      return await this.internalMinioClient.presignedGetObject(this.bucketName, key, expiry);
    } catch (e) {
      const error = e as MinioError;
      this.logger.error(`Error generating internal GET URL for ${key}: ${error.message}`);
      throw new StorageUploadException(key, error.message);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, key);
      this.logger.debug(`Deleted object: ${key}`);
    } catch (e) {
      const error = e as MinioError;
      this.logger.error(`Error deleting object ${key}: ${error.message}`);
      throw new StorageDeleteException(key, error.message);
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (!keys.length) return;

    try {
      await this.minioClient.removeObjects(this.bucketName, keys);
      this.logger.debug(`Bulk deleted ${keys.length} objects`);
    } catch (e) {
      const error = e as MinioError;
      this.logger.error(`Error bulk deleting objects: ${error.message}`);
      throw new StorageDeleteException('BULK_DELETE', error.message);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, key);
      return true;
    } catch (e) {
      const error = e as MinioError;
      if (error.code === 'NotFound') {
        return false;
      }
      this.logger.error(`Error checking existence of object ${key}: ${error.message}`);
      throw new StorageConnectionException('MinIO', error.message);
    }
  }

  async statObject(key: string): Promise<Minio.BucketItemStat> {
    try {
      return await this.minioClient.statObject(this.bucketName, key);
    } catch (e) {
      const error = e as MinioError;
      this.logger.error(`Error getting stats for object ${key}: ${error.message}`);
      throw new StorageConnectionException('MinIO', error.message);
    }
  }
}
