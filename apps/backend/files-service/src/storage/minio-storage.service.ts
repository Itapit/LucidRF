import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { MINIO_CLIENT, STORAGE_BUCKET_NAME } from './storage.constants';
import { StorageService } from './storage.service';

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
      // We log but don't throw here to prevent the service from crashing on boot
      // if MinIO is momentarily unavailable (e.g. docker startup order).
    }
  }

  async getPresignedPutUrl(key: string, expiry = 3600): Promise<string> {
    try {
      return await this.minioClient.presignedPutObject(this.bucketName, key, expiry);
    } catch (error) {
      this.logger.error(`Error generating PUT URL for ${key}: ${error.message}`);
      throw error;
    }
  }

  async getPresignedGetUrl(key: string, expiry = 3600): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, key, expiry);
    } catch (error) {
      this.logger.error(`Error generating GET URL for ${key}: ${error.message}`);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, key);
      this.logger.debug(`Deleted object: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting object ${key}: ${error.message}`);
      throw error;
    }
  }
}
