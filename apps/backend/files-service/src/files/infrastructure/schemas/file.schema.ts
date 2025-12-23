import { FileStatus } from '@LucidRF/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { FileEntity } from '../../domain/entities';
import { PermissionSchema, PermissionSchemaFactory } from './permission.schema';

export type FileDocument = FileSchema & Document;

@Schema({ collection: 'files', timestamps: true })
export class FileSchema extends Document {
  @Prop({ required: true })
  originalFileName: string;

  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true, enum: FileStatus, type: String, default: FileStatus.PENDING })
  status: FileStatus;

  // Infrastructure
  @Prop({ required: true, unique: true })
  storageKey: string;

  @Prop({ required: true })
  bucket: string;

  // Hierarchy, Internal Reference uses ObjectId
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Folder', default: null, index: true })
  parentFolderId: MongooseSchema.Types.ObjectId;

  // Embedded Permissions
  @Prop({ type: [PermissionSchemaFactory], default: [] })
  permissions: PermissionSchema[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const FileSchemaFactory = SchemaFactory.createForClass(FileSchema);

// --- The Mapper is where we ensure "Compatibility" ---
export function toFileEntity(doc: FileDocument): FileEntity {
  if (!doc) return null;
  const obj = doc.toObject();

  return new FileEntity({
    ...obj,
    _id: obj._id.toString(), // Convert ObjectId -> string
    parentFolderId: obj.parentFolderId?.toString() || null, // Convert ObjectId -> string
    permissions:
      obj.permissions?.map((p) => ({
        subjectId: p.subjectId,
        subjectType: p.subjectType,
        role: p.role,
      })) || [],
  });
}
