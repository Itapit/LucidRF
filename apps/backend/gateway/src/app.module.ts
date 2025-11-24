import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, AuthModule, GroupsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
