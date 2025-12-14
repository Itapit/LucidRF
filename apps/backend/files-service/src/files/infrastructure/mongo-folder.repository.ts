import { PermissionType } from '@limbo/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFolderRepoDto } from '../domain/dtos/create-folder-repository.dto';
import { FolderEntity } from '../domain/folder.entity';
import { FolderRepository } from '../domain/folder.repository';
import { Permission } from '../domain/permission.entity';
import { FolderSchema, toFolderEntity } from './schemas/folder.schema';

@Injectable()
export class MongoFolderRepository implements FolderRepository {
  constructor(@InjectModel(FolderSchema.name) private readonly folderModel: Model<FolderSchema>) {}

  async create(dto: CreateFolderRepoDto): Promise<FolderEntity> {
    const created = new this.folderModel(dto);
    const saved = await created.save();
    return toFolderEntity(saved);
  }

  async findById(id: string): Promise<FolderEntity | null> {
    const doc = await this.folderModel.findById(id).exec();
    return toFolderEntity(doc);
  }

  async findSubFolders(parentFolderId: string | null, ownerId: string): Promise<FolderEntity[]> {
    const query = {
      parentFolderId: parentFolderId,
      ownerId: ownerId,
    };
    const docs = await this.folderModel.find(query).exec();
    return docs.map(toFolderEntity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.folderModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Folder ${id} not found`);
  }

  // --- Permission Logic (Identical to File) ---

  async addPermission(id: string, permission: Permission): Promise<FolderEntity> {
    await this.folderModel
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

    const doc = await this.folderModel
      .findByIdAndUpdate(id, { $push: { permissions: permission } }, { new: true })
      .exec();

    if (!doc) throw new NotFoundException(`Folder ${id} not found`);
    return toFolderEntity(doc);
  }

  async removePermission(id: string, subjectId: string, subjectType: PermissionType): Promise<FolderEntity> {
    const doc = await this.folderModel
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

    if (!doc) throw new NotFoundException(`Folder ${id} not found`);
    return toFolderEntity(doc);
  }
}
