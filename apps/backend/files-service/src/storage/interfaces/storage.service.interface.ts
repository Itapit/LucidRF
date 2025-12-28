import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class StorageService {
  /**
   * Generates a presigned URL for uploading a file directly to storage.
   * @param key The unique key (filename) for the object.
   * @param expiry Expiration time in seconds (default: 3600).
   */
  abstract getPresignedPutUrl(key: string, expiry?: number): Promise<string>;

  /**
   * Generates a presigned URL for downloading/viewing a file.
   * @param key The unique key (filename) for the object.
   * @param expiry Expiration time in seconds (default: 3600).
   */
  abstract getPresignedGetUrl(key: string, expiry?: number): Promise<string>;

  /**
   * Deletes a file from the storage bucket.
   * @param key The unique key of the object to delete.
   */
  abstract delete(key: string): Promise<void>;
}
