import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshTokenSchema } from './refresh-token.schema';

@Injectable()
export class MongoRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshTokenSchema.name)
    private refreshTokenModel: Model<RefreshTokenSchema>
  ) {}

  async create(userId: string, jti: string, expiresAt: Date, userAgent?: string): Promise<RefreshTokenSchema> {
    const newToken = new this.refreshTokenModel({
      userId,
      jti,
      expiresAt,
      userAgent,
    });
    return newToken.save();
  }

  async findByJti(jti: string): Promise<RefreshTokenSchema | null> {
    return this.refreshTokenModel.findOne({ jti }).exec();
  }

  async delete(jti: string): Promise<void> {
    await this.refreshTokenModel.deleteOne({ jti }).exec();
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.refreshTokenModel.deleteMany({ userId }).exec();
  }
}
