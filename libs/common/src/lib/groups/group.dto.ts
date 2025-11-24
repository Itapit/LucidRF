export class GroupDto {
  id!: string;
  name!: string;
  description?: string;
  ownerId!: string;
  members!: string[];
  createdAt!: Date;
  updatedAt!: Date;
}
