import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty } from 'class-validator';

export class DeleteTeamPayload {
  @IsNotEmpty()
  @IsResourceId()
  teamId!: string;

  @IsNotEmpty()
  @IsResourceId()
  actorId!: string; // The user performing the deletion (must be owner)
}
