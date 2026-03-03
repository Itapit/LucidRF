import { TeamColor, TeamType, UpdateTeamRequest } from '@LucidRF/common';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeamDto implements UpdateTeamRequest {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsEnum(TeamType)
  @IsOptional()
  type?: TeamType;

  @IsEnum(TeamColor)
  @IsOptional()
  color?: TeamColor;
}
