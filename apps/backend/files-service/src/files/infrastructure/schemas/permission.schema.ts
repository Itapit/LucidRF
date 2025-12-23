import { PermissionRole, PermissionType } from '@LucidRF/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PermissionSchema {
  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true, enum: PermissionType, type: String })
  subjectType: PermissionType;

  @Prop({ required: true, enum: PermissionRole, type: String })
  role: PermissionRole;
}

export const PermissionSchemaFactory = SchemaFactory.createForClass(PermissionSchema);
