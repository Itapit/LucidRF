import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteGroupPayload {
  @IsNotEmpty()
  @IsMongoId()
  groupId!: string;

  @IsNotEmpty()
  @IsMongoId()
  actorId!: string; // The user performing the deletion (must be owner)
}
