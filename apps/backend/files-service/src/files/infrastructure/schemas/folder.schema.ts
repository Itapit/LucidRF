import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { FolderEntity } from '../../domain/entities';
import { PermissionSchema, PermissionSchemaFactory } from './permission.schema';

export type FolderDocument = FolderSchema & Document;

@Schema({ collection: 'folders', timestamps: true })
export class FolderSchema extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, index: true })
  ownerId: string;

  // Hierarchy
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Folder', default: null, index: true })
  parentFolderId: MongooseSchema.Types.ObjectId;

  // Embedded Permissions
  @Prop({ type: [PermissionSchemaFactory], default: [] })
  permissions: PermissionSchema[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const FolderSchemaFactory = SchemaFactory.createForClass(FolderSchema);

// --- Mapper ---
export function toFolderEntity(doc: FolderDocument): FolderEntity {
  if (!doc) return null;
  const obj = doc.toObject();

  return new FolderEntity({
    ...obj,
    _id: obj._id.toString(),
    parentFolderId: obj.parentFolderId?.toString() || null,
    permissions:
      obj.permissions?.map((p) => ({
        subjectId: p.subjectId,
        subjectType: p.subjectType,
        role: p.role,
      })) || [],
  });
}
