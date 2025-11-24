import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupPayload {
  @IsNotEmpty()
  @IsMongoId()
  groupId!: string;

  @IsNotEmpty()
  @IsMongoId()
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
