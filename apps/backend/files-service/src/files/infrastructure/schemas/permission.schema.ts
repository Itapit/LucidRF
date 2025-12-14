import { PermissionRole, PermissionType } from '@limbo/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PermissionSchema {
  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true, enum: PermissionType })
  subjectType: PermissionType;

  @Prop({ required: true, enum: PermissionRole })
  role: PermissionRole;
}

export const PermissionSchemaFactory = SchemaFactory.createForClass(PermissionSchema);
