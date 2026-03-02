import { IsResourceId } from '@LucidRF/backend-common';
import { TeamType } from '@LucidRF/common';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamPayload {
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

  @IsOptional()
  @IsEnum(TeamType)
  type?: TeamType = TeamType.COLLABORATIVE;
}
