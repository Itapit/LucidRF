import { FileStatus } from '@limbo/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FileDocument = FileSchema & Document;

@Schema({ timestamps: true, collection: 'files' })
export class FileSchema {
  // Key is required for Files, but optional for Folders (as they are virtual)
  @Prop({ unique: true, sparse: true })
  key?: string;

  @Prop({ required: true })
  originalName: string;

  // Optional for folders
  @Prop()
  mimeType?: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({
    required: true,
    type: String,
    enum: FileStatus,
    default: FileStatus.PENDING,
  })
  status: FileStatus;

  @Prop()
  size?: number;

  // --- Folder & Sharing Logic ---

  @Prop({ default: false })
  isFolder: boolean;

  // Points to the _id of the parent Folder. Null = Root Directory.
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'FileSchema',
    default: null,
  })
  parentId?: string;

  // List of User IDs who can access this file
  @Prop({ type: [String], default: [] })
  sharedWithUsers: string[];

  // List of Group IDs who can access this file
  @Prop({ type: [String], default: [] })
  sharedWithGroups: string[];
}

export const FileSchemaFactory = SchemaFactory.createForClass(FileSchema);

//  "Get all files in this folder for this user"
FileSchemaFactory.index({ ownerId: 1, parentId: 1 });
// "Get files shared with me"
FileSchemaFactory.index({ sharedWithUsers: 1 });
FileSchemaFactory.index({ sharedWithGroups: 1 });
