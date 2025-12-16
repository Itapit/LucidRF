import { PermissionType } from '@LucidRF/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFileRepoDto } from '../domain/dtos/create-file-repo.dto';
import { FileEntity } from '../domain/file.entity';
import { FileRepository } from '../domain/file.repository';
import { Permission } from '../domain/permission.entity';
import { FileSchema, toFileEntity } from './schemas/file.schema';

@Injectable()
export class MongoFileRepository implements FileRepository {
  constructor(@InjectModel(FileSchema.name) private readonly fileModel: Model<FileSchema>) {}

  async create(dto: CreateFileRepoDto): Promise<FileEntity> {
    const created = new this.fileModel(dto);
    const saved = await created.save();
    return toFileEntity(saved);
  }

  async findById(id: string): Promise<FileEntity | null> {
    const doc = await this.fileModel.findById(id).exec();
    return toFileEntity(doc);
  }

  /**
   * Returns files where the user is the OWNER OR has PERMISSION.
   */
  async findByFolder(folderId: string | null, userId: string): Promise<FileEntity[]> {
    const query = {
      parentFolderId: folderId,
      $or: [
        { ownerId: userId },
        { 'permissions.subjectId': userId }, // Shared with the user
      ],
    };
    const docs = await this.fileModel.find(query).exec();
    return docs.map(toFileEntity);
  }

  /**
   * System Level Access (No Owner Filter)
   * Used for Permission Propagation to find all files in a folder.
   */
  async findByFolderIdSystem(folderId: string): Promise<FileEntity[]> {
    const docs = await this.fileModel.find({ parentFolderId: folderId }).exec();
    return docs.map(toFileEntity);
  }

  async updateStatus(id: string, status: string): Promise<FileEntity> {
    const doc = await this.fileModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!doc) throw new NotFoundException(`File ${id} not found`);
    return toFileEntity(doc);
  }

  async delete(id: string): Promise<void> {
    const result = await this.fileModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`File ${id} not found`);
  }
  /**
   * Bulk Delete
   * Used for Recursive Deletion to remove all files in a folder at once.
   */
  async deleteManyByFolderId(folderId: string): Promise<void> {
    await this.fileModel.deleteMany({ parentFolderId: folderId }).exec();
  }

  // --- Permission Logic ---

  async addPermission(id: string, permission: Permission): Promise<FileEntity> {
    // Remove existing permission for this subject (if any) to avoid duplicates
    await this.fileModel
      .updateOne(
        { _id: id },
        { $pull: { permissions: { subjectId: permission.subjectId, subjectType: permission.subjectType } } }
      )
      .exec();

    // Push new permission
    const doc = await this.fileModel
      .findByIdAndUpdate(id, { $push: { permissions: permission } }, { new: true })
      .exec();

    if (!doc) throw new NotFoundException(`File ${id} not found`);
    return toFileEntity(doc);
  }

  async removePermission(id: string, subjectId: string, subjectType: PermissionType): Promise<FileEntity> {
    const doc = await this.fileModel
      .findByIdAndUpdate(id, { $pull: { permissions: { subjectId, subjectType } } }, { new: true })
      .exec();

    if (!doc) throw new NotFoundException(`File ${id} not found`);
    return toFileEntity(doc);
  }
}
