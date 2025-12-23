import { IsResourceId } from '@LucidRF/common';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupPayload {
  @IsNotEmpty()
  @IsResourceId()
  groupId!: string;

  @IsNotEmpty()
  @IsResourceId()
  actorId!: string; // The user performing the update

  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;
}
