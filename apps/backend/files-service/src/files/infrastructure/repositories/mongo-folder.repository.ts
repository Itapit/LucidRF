import { PermissionType } from '@LucidRF/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyBulkWriteOperation, Model } from 'mongoose';
import { BulkPermissionOperation, CreateFolderRepoDto } from '../../domain/dtos';
import { FolderEntity, PermissionEntity } from '../../domain/entities';
import { PermissionAction } from '../../domain/enums';
import { FolderRepository } from '../../domain/interfaces';
import { DatabaseContext } from '../persistence/database.context';
import { FolderSchema, toFolderEntity } from '../schemas';

@Injectable()
export class MongoFolderRepository implements FolderRepository {
  constructor(
    @InjectModel(FolderSchema.name) private readonly folderModel: Model<FolderSchema>,
    private readonly dbContext: DatabaseContext
  ) {}

  async create(dto: CreateFolderRepoDto): Promise<FolderEntity> {
    const session = this.dbContext.getSession();
    const created = new this.folderModel(dto);
    const saved = await created.save({ session });
    return toFolderEntity(saved);
  }

  async findById(id: string): Promise<FolderEntity | null> {
    const session = this.dbContext.getSession();
    const doc = await this.folderModel.findById(id).session(session).exec();
    return toFolderEntity(doc);
  }

  /**
   * Returns folders where the user is the OWNER OR has PERMISSION.
   */
  async findSubFolders(parentFolderId: string | null, userId: string): Promise<FolderEntity[]> {
    const session = this.dbContext.getSession();
    const query = {
      parentFolderId: parentFolderId,
      $or: [{ ownerId: userId }, { 'permissions.subjectId': userId }],
    };
    const docs = await this.folderModel.find(query).session(session).exec();
    return docs.map(toFolderEntity);
  }

  /**
   * System Level Access (No Owner Filter)
   * Used for Recursive Deletion and Permission Propagation.
   */
  async findSubFoldersByParentIdSystem(parentFolderId: string): Promise<FolderEntity[]> {
    const session = this.dbContext.getSession();
    const docs = await this.folderModel.find({ parentFolderId: parentFolderId }).session(session).exec();
    return docs.map(toFolderEntity);
  }

  async delete(id: string): Promise<void> {
    const session = this.dbContext.getSession();
    const result = await this.folderModel.findByIdAndDelete(id).session(session).exec();
    if (!result) throw new NotFoundException(`Folder ${id} not found`);
  }

  // --- Permission Logic (Identical to File) ---

  async addPermission(id: string, permission: PermissionEntity): Promise<FolderEntity> {
    const session = this.dbContext.getSession();
    await this.folderModel
      .updateOne(
        { _id: id },
        { $pull: { permissions: { subjectId: permission.subjectId, subjectType: permission.subjectType } } }
      )
      .session(session)
      .exec();

    const doc = await this.folderModel
      .findByIdAndUpdate(id, { $push: { permissions: permission } }, { new: true })
      .session(session)
      .exec();

    if (!doc) throw new NotFoundException(`Folder ${id} not found`);
    return toFolderEntity(doc);
  }

  async removePermission(id: string, subjectId: string, subjectType: PermissionType): Promise<FolderEntity> {
    const session = this.dbContext.getSession();
    const doc = await this.folderModel
      .findByIdAndUpdate(id, { $pull: { permissions: { subjectId, subjectType } } }, { new: true })
      .session(session)
      .exec();

    if (!doc) throw new NotFoundException(`Folder ${id} not found`);
    return toFolderEntity(doc);
  }

  async updatePermissionsBulk(operations: BulkPermissionOperation[]): Promise<void> {
    const session = this.dbContext.getSession();
    if (operations.length === 0) return;

    const bulkOps: AnyBulkWriteOperation<FolderSchema>[] = [];

    for (const op of operations) {
      if (op.action === PermissionAction.ADD || op.action === PermissionAction.UPDATE) {
        bulkOps.push(...this.createAddOperations(op));
      } else {
        bulkOps.push(this.createRemoveOperation(op));
      }
    }

    await this.folderModel.bulkWrite(bulkOps, { session, ordered: true });
  }

  // -- private helpers --

  private createAddOperations(op: BulkPermissionOperation): AnyBulkWriteOperation<FolderSchema>[] {
    const filter = { _id: op.resourceId };
    const permissionQuery = {
      subjectId: op.permission.subjectId,
      subjectType: op.permission.subjectType,
    };

    return [
      { updateOne: { filter, update: { $pull: { permissions: permissionQuery } } } },
      { updateOne: { filter, update: { $push: { permissions: op.permission } } } },
    ];
  }

  private createRemoveOperation(op: BulkPermissionOperation): AnyBulkWriteOperation<FolderSchema> {
    return {
      updateOne: {
        filter: { _id: op.resourceId },
        update: {
          $pull: {
            permissions: {
              subjectId: op.permission.subjectId,
              subjectType: op.permission.subjectType,
            },
          },
        },
      },
    };
  }
}
