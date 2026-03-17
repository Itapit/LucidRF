import { TeamColor, TeamType, UpdateTeamRequest } from '@LucidRF/common';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeamDto implements UpdateTeamRequest {
  /**
   * Updated name for the team
   * @example 'Global Engineering Team'
   */
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  /**
   * Updated description for the team
   */
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  /**
   * Updated type for the team
   */
  @IsEnum(TeamType)
  @IsOptional()
  type?: TeamType;

  /**
   * Updated theme color for the team UI
   */
  @IsEnum(TeamColor)
  @IsOptional()
  color?: TeamColor;
}
