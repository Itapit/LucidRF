import { IsResourceId } from '@LucidRF/backend-common';
import { TeamColor } from '@LucidRF/common';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeamPayload {
  @IsNotEmpty()
  @IsResourceId()
  teamId!: string;

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

  @IsEnum(TeamColor)
  @IsOptional()
  color?: TeamColor;
}
