import { UserRole, UserStatus } from '@limbo/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserSchema & Document;

@Schema({ collection: 'users', timestamps: true })
export class UserSchema extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;
}

export const UserSchemaFactory = SchemaFactory.createForClass(UserSchema);
