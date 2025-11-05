import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RefreshTokenDocument = RefreshTokenSchema & Document;

@Schema({ collection: 'refresh_tokens', timestamps: true })
export class RefreshTokenSchema extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserSchema',
    required: true,
    index: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true, unique: true, index: true })
  jti: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: String })
  userAgent?: string;
}

export const RefreshTokenSchemaFactory = SchemaFactory.createForClass(RefreshTokenSchema);

RefreshTokenSchemaFactory.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
