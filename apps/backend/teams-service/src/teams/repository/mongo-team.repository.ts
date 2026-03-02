import { TeamRole } from '@LucidRF/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTeamRepoDto } from './create-team-repo.dto';
import { TeamRepository } from './team.repository';
import { TeamSchema } from './team.schema';

@Injectable()
export class TeamMongoRepository implements TeamRepository {
  constructor(@InjectModel(TeamSchema.name) private readonly teamModel: Model<TeamSchema>) {}

  async create(dto: CreateTeamRepoDto): Promise<TeamSchema> {
    const documentData = {
      ...dto,
      members: dto.members.map((m) => ({
        userId: new Types.ObjectId(m.userId),
        role: m.role,
      })),
    };
    const createdTeam = new this.teamModel(documentData);
    return createdTeam.save();
  }

  async findById(id: string): Promise<TeamSchema | null> {
    return this.teamModel.findById(id).exec();
  }

  async findByMemberId(userId: string): Promise<TeamSchema[]> {
    return this.teamModel.find({ 'members.userId': new Types.ObjectId(userId) }).exec();
  }

  async update(id: string, updateData: Partial<TeamSchema>): Promise<TeamSchema | null> {
    return this.teamModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async addMember(teamId: string, userId: string, role: TeamRole): Promise<TeamSchema | null> {
    return this.teamModel
      .findByIdAndUpdate(teamId, { $push: { members: { userId: new Types.ObjectId(userId), role } } }, { new: true })
      .exec();
  }

  async removeMember(teamId: string, userId: string): Promise<TeamSchema | null> {
    return this.teamModel
      .findByIdAndUpdate(teamId, { $pull: { members: { userId: new Types.ObjectId(userId) } } }, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.teamModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async isUserInTeam(teamId: string, userId: string): Promise<boolean> {
    const count = await this.teamModel.countDocuments({
      _id: teamId,
      'members.userId': new Types.ObjectId(userId),
    });
    return count > 0;
  }
}
