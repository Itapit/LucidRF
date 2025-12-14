import { PermissionType } from '@limbo/common';
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

  async findByFolder(folderId: string | null, ownerId: string): Promise<FileEntity[]> {
    const query = {
      parentFolderId: folderId,
      ownerId: ownerId,
    };
    const docs = await this.fileModel.find(query).exec();
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

  // --- Permission Logic ---

  async addPermission(id: string, permission: Permission): Promise<FileEntity> {
    // 1. Remove existing permission for this subject (if any) to avoid duplicates
    await this.fileModel
      .updateOne(
        { _id: id },
        {
          $pull: {
            permissions: {
              subjectId: permission.subjectId,
              subjectType: permission.subjectType,
            },
          },
        }
      )
      .exec();

    // 2. Add the new permission
    const doc = await this.fileModel
      .findByIdAndUpdate(id, { $push: { permissions: permission } }, { new: true })
      .exec();

    if (!doc) throw new NotFoundException(`File ${id} not found`);
    return toFileEntity(doc);
  }

  async removePermission(id: string, subjectId: string, subjectType: PermissionType): Promise<FileEntity> {
    const doc = await this.fileModel
      .findByIdAndUpdate(
        id,
        {
          $pull: {
            permissions: {
              subjectId: subjectId,
              subjectType: subjectType,
            },
          },
        },
        { new: true }
      )
      .exec();

    if (!doc) throw new NotFoundException(`File ${id} not found`);
    return toFileEntity(doc);
  }
}
