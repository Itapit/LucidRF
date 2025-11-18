import { Types } from 'mongoose';

export class CreateGroupRepoDto {
  name: string;
  description?: string;
  ownerId: Types.ObjectId;
  members: Types.ObjectId[];
}
