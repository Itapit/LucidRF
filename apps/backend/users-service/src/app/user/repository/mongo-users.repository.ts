import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserRepoDto } from '../dtos/create-user-repo.dto';
import { UserSchema } from './user.schema';
import { UsersRepository } from './users.repository';

// This is the Mongoose implementation of the UsersRepository.
@Injectable()
export class MongoUsersRepository implements UsersRepository {
  constructor(@InjectModel(UserSchema.name) private userModel: Model<UserSchema>) {}

  async create(dto: CreateUserRepoDto): Promise<UserSchema> {
    const newUser = new this.userModel(dto);
    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserSchema | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserSchema | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmailWithCredentials(email: string): Promise<UserSchema | null> {
    return this.userModel.findOne({ email }).select('+password +refreshTokenVersion').exec();
  }

  async update(id: string, updates: Partial<UserSchema>): Promise<UserSchema | null> {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }
}
