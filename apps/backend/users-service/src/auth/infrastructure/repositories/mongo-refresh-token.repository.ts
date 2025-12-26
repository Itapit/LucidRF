import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenEntity, RefreshTokenRepository, toRefreshTokenEntity } from '../../domain';
import { RefreshTokenSchema } from '../schemas';

@Injectable()
export class MongoRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshTokenSchema.name)
    private refreshTokenModel: Model<RefreshTokenSchema>
  ) {}

  async create(userId: string, jti: string, expiresAt: Date, userAgent?: string): Promise<RefreshTokenEntity> {
    const created = new this.refreshTokenModel({
      userId,
      jti,
      expiresAt,
      userAgent,
    });
    const saved = await created.save();
    return toRefreshTokenEntity(saved);
  }

  async findByJti(jti: string): Promise<RefreshTokenEntity | null> {
    const doc = await this.refreshTokenModel.findOne({ jti }).exec();
    return doc ? toRefreshTokenEntity(doc) : null;
  }

  async delete(jti: string): Promise<void> {
    await this.refreshTokenModel.deleteOne({ jti }).exec();
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.refreshTokenModel.deleteMany({ userId }).exec();
  }
}
