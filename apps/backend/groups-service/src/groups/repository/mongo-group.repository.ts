import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateGroupRepoDto } from './create-group-repo.dto';
import { GroupRepository } from './group.repository';
import { GroupSchema } from './group.schema';

@Injectable()
export class GroupMongoRepository implements GroupRepository {
  constructor(@InjectModel(GroupSchema.name) private readonly groupModel: Model<GroupSchema>) {}

  async create(dto: CreateGroupRepoDto): Promise<GroupSchema> {
    const createdGroup = new this.groupModel(dto);
    return createdGroup.save();
  }

  async findById(id: string): Promise<GroupSchema | null> {
    return this.groupModel.findById(id).exec();
  }

  async findByMemberId(userId: string): Promise<GroupSchema[]> {
    return this.groupModel.find({ members: new Types.ObjectId(userId) }).exec();
  }

  async update(id: string, updateData: Partial<GroupSchema>): Promise<GroupSchema | null> {
    return this.groupModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async addMember(groupId: string, userId: string): Promise<GroupSchema | null> {
    return this.groupModel
      .findByIdAndUpdate(groupId, { $addToSet: { members: new Types.ObjectId(userId) } }, { new: true })
      .exec();
  }

  async removeMember(groupId: string, userId: string): Promise<GroupSchema | null> {
    return this.groupModel
      .findByIdAndUpdate(groupId, { $pull: { members: new Types.ObjectId(userId) } }, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.groupModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async isUserInGroup(groupId: string, userId: string): Promise<boolean> {
    const count = await this.groupModel.countDocuments({
      _id: groupId,
      members: new Types.ObjectId(userId),
    });
    return count > 0;
  }
}
