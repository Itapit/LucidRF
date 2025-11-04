import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoUsersRepository } from './repository/mongo-users.repository';
import { UserSchema, UserSchemaFactory } from './repository/user.schema';
import { UsersRepository } from './repository/users.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserSchema.name, schema: UserSchemaFactory }])],
  providers: [
    UserService,
    {
      provide: UsersRepository,
      useClass: MongoUsersRepository,
    },
  ],
  controllers: [UserController],
  exports: [UsersRepository],
})
export class UserModule {}
