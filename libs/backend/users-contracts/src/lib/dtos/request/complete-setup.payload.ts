import { IsMongoId, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CompleteSetupPayload {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;
}
