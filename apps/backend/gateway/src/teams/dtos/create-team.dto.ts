import { CreateTeamRequest, TeamType } from '@LucidRF/common';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, NotEquals } from 'class-validator';

export class CreateTeamDto implements CreateTeamRequest {
  /**
   * Name of the team
   * @example 'Engineering Team'
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  /**
   * Brief description of the team
   * @example 'Developers responsible for the core platform'
   */
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  /**
   * Type of the team
   */
  @IsOptional()
  @IsEnum(TeamType)
  @NotEquals(TeamType.PERSONAL, { message: 'Cannot manually create a personal team' })
  type?: TeamType = TeamType.COLLABORATIVE;
}
