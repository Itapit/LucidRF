import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGroupPayload {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsNotEmpty()
  @IsResourceId()
  ownerId!: string;
}
