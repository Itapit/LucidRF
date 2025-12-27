import { applyDecorators } from '@nestjs/common';
import { IsMongoId, IsString } from 'class-validator';

/**
 * Wraps database-specific ID validation.
 * If the project moves to UUIDs (e.g., PostgreSQL),
 * only this file needs to change.
 */
export function IsResourceId() {
  return applyDecorators(
    IsString(),
    IsMongoId() // Currently MongoDB based
  );
}
