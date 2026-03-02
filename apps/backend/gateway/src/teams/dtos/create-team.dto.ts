import { CreateTeamRequest, TeamType } from '@LucidRF/common';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto implements CreateTeamRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsEnum(TeamType)
  @IsOptional()
  type?: TeamType;
}
