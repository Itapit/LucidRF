import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFileRepoDto } from '../../domain/dtos';
import { FileEntity } from '../../domain/entities';
import { FileRepository } from '../../domain/interfaces';
import { DatabaseContext } from '../persistence';
import { FileSchema, toFileEntity } from '../schemas';

@Injectable()
export class MongoFileRepository implements FileRepository {
  constructor(
    @InjectModel(FileSchema.name) private readonly fileModel: Model<FileSchema>,
    private readonly dbContext: DatabaseContext
  ) {}

  async create(dto: CreateFileRepoDto): Promise<FileEntity> {
    const session = this.dbContext.getSession();
    const created = new this.fileModel(dto);
    const saved = await created.save({ session });
    return toFileEntity(saved);
  }

  async findById(id: string): Promise<FileEntity | null> {
    const session = this.dbContext.getSession();
    const doc = await this.fileModel.findById(id).session(session).exec();
    return toFileEntity(doc);
  }

  /**
   * Returns files that belong to any of the provided team IDs.
   */
  async findByFolder(folderId: string | null, teamIds: string[]): Promise<FileEntity[]> {
    const session = this.dbContext.getSession();
    const query = {
      parentFolderId: folderId,
      teamId: { $in: teamIds },
    };
    const docs = await this.fileModel.find(query).session(session).exec();
    return docs.map(toFileEntity);
  }

  /**
   * System Level Access (No Team Filter)
   * Used for Permission Propagation to find all files in a folder.
   */
  async findByFolderIdSystem(folderId: string): Promise<FileEntity[]> {
    const session = this.dbContext.getSession();
    const docs = await this.fileModel.find({ parentFolderId: folderId }).session(session).exec();
    return docs.map(toFileEntity);
  }

  async updateStatus(id: string, status: string): Promise<FileEntity> {
    const session = this.dbContext.getSession();
    const doc = await this.fileModel.findByIdAndUpdate(id, { status }, { new: true }).session(session).exec();
    return toFileEntity(doc);
  }

  async delete(id: string): Promise<boolean> {
    const session = this.dbContext.getSession();
    const result = await this.fileModel.findByIdAndDelete(id).session(session).exec();
    return !!result;
  }

  /**
   * Bulk Delete
   * Used for Recursive Deletion to remove all files in a folder at once.
   */
  async deleteManyByFolderId(folderId: string): Promise<void> {
    const session = this.dbContext.getSession();
    await this.fileModel.deleteMany({ parentFolderId: folderId }).session(session).exec();
  }

  async findByTeamIdSystem(teamId: string): Promise<FileEntity[]> {
    const session = this.dbContext.getSession();
    const docs = await this.fileModel.find({ teamId }).session(session).exec();
    return docs.map(toFileEntity);
  }

  async deleteManyByTeamId(teamId: string): Promise<void> {
    const session = this.dbContext.getSession();
    await this.fileModel.deleteMany({ teamId }).session(session).exec();
  }
}
