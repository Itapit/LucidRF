import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type GroupDocument = GroupSchema & Document;

@Schema({ collection: 'groups', timestamps: true })
export class GroupSchema extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, trim: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId }], default: [], index: true })
  members: MongooseSchema.Types.ObjectId[];

  // TypeScript definitions for Mongoose timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const GroupSchemaFactory = SchemaFactory.createForClass(GroupSchema);
