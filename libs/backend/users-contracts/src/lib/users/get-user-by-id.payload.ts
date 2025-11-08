import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetUserByIdPayload {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;
}
