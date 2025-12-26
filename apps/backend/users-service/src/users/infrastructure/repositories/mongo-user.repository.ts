import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserRepoDto, toUserEntity, UserEntity, UserRepository } from '../../domain';
import { UserSchema } from '../schemas';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(@InjectModel(UserSchema.name) private userModel: Model<UserSchema>) {}

  async create(dto: CreateUserRepoDto): Promise<UserEntity> {
    const newUser = new this.userModel(dto);
    const saved = await newUser.save();
    return toUserEntity(saved);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    return doc ? toUserEntity(doc) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findById(id).exec();
    return doc ? toUserEntity(doc) : null;
  }

  /**
   * Explicitly selects the password for authentication checks.
   */
  async findByEmailWithCredentials(email: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ email }).select('+password').exec();
    return doc ? toUserEntity(doc) : null;
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const doc = await this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    return doc ? toUserEntity(doc) : null;
  }
}
