import { UpdateGroupRequest } from '@limbo/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupDto implements UpdateGroupRequest {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;
}
