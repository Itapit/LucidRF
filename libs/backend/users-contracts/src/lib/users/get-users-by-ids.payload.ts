import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class GetUsersByIdsPayload {
  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true }) // Using IsMongoId directly to support 'each'
  userIds!: string[];
}
