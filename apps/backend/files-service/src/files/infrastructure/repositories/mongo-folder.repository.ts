import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFolderRepoDto } from '../../domain/dtos';
import { FolderEntity } from '../../domain/entities';
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
   * Returns folders that belong to any of the provided team IDs.
   */
  async findSubFolders(parentFolderId: string | null, teamIds: string[]): Promise<FolderEntity[]> {
    const session = this.dbContext.getSession();
    const query = {
      parentFolderId: parentFolderId,
      teamId: { $in: teamIds },
    };
    const docs = await this.folderModel.find(query).session(session).exec();
    return docs.map(toFolderEntity);
  }

  /**
   * System Level Access (No Team Filter)
   * Used for Recursive Deletion and Permission Propagation.
   */
  async findSubFoldersByParentIdSystem(parentFolderId: string): Promise<FolderEntity[]> {
    const session = this.dbContext.getSession();
    const docs = await this.folderModel.find({ parentFolderId: parentFolderId }).session(session).exec();
    return docs.map(toFolderEntity);
  }

  async delete(id: string): Promise<boolean> {
    const session = this.dbContext.getSession();
    const result = await this.folderModel.findByIdAndDelete(id).session(session).exec();
    return !!result;
  }
}
