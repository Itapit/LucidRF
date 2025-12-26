import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityModule } from '../security';
import { UserService } from './application';
import { UserRepository } from './domain';
import { MongoUserRepository } from './infrastructure/repositories';
import { UserSchema, UserSchemaFactory } from './infrastructure/schemas';
import { UserController } from './users.controller';

@Module({
  imports: [
    SecurityModule,
    MongooseModule.forFeature([
      {
        name: UserSchema.name,
        schema: UserSchemaFactory,
      },
    ]),
  ],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: MongoUserRepository,
    },
  ],
  controllers: [UserController],
  exports: [UserRepository, UserService],
})
export class UserModule {}
