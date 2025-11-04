import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoUserRepository } from './repository/mongo-users.repository';
import { UserRepository } from './repository/user.repository';
import { UserSchema, UserSchemaFactory } from './repository/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserSchema.name, schema: UserSchemaFactory }])],
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
