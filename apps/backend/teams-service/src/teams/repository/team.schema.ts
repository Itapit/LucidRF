import { TeamColor, TeamRole, TeamType } from '@LucidRF/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TeamDocument = TeamSchema & Document;

@Schema({ _id: false })
export class TeamMemberSchema {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: TeamRole, required: true })
  role: TeamRole;
}
export const TeamMemberSchemaFactory = SchemaFactory.createForClass(TeamMemberSchema);

@Schema({ collection: 'teams', timestamps: true })
export class TeamSchema extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, trim: true })
  description: string;

  @Prop({ type: String, enum: TeamType, required: true, default: TeamType.COLLABORATIVE })
  type: TeamType;

  @Prop({ type: String, enum: TeamColor, required: true })
  color: TeamColor;

  @Prop({ type: String, required: true, trim: true, maxlength: 2 })
  initials: string;

  @Prop({ type: [TeamMemberSchemaFactory], default: [] })
  members: TeamMemberSchema[];

  // TypeScript definitions for Mongoose timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const TeamSchemaFactory = SchemaFactory.createForClass(TeamSchema);
