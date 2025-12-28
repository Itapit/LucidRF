import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { StorageConnectionException, StorageDeleteException, StorageUploadException } from './exceptions';
import { StorageService } from './interfaces/storage.service.interface';
import { DEFAULT_PRESIGNED_URL_EXPIRY, MINIO_CLIENT, STORAGE_BUCKET_NAME } from './storage.constants';

@Injectable()
export class MinioStorageService implements StorageService, OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);

  constructor(
    @Inject(MINIO_CLIENT) private readonly minioClient: Minio.Client,
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
    } catch (error) {
      this.logger.error(`Failed to verify/create bucket '${this.bucketName}': ${error.message}`);
      throw new StorageConnectionException('MinIO', error.message);
    }
  }

  async getPresignedPutUrl(key: string, expiry = DEFAULT_PRESIGNED_URL_EXPIRY): Promise<string> {
    try {
      return await this.minioClient.presignedPutObject(this.bucketName, key, expiry);
    } catch (error) {
      this.logger.error(`Error generating PUT URL for ${key}: ${error.message}`);
      throw new StorageUploadException(key, error.message);
    }
  }

  async getPresignedGetUrl(key: string, expiry = DEFAULT_PRESIGNED_URL_EXPIRY): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, key, expiry);
    } catch (error) {
      this.logger.error(`Error generating GET URL for ${key}: ${error.message}`);
      throw new StorageUploadException(key, error.message);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, key);
      this.logger.debug(`Deleted object: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting object ${key}: ${error.message}`);
      throw new StorageDeleteException(key, error.message);
    }
  }
}
