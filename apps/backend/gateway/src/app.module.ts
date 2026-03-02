import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { HealthModule } from './health/health.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [HealthModule, UsersModule, AuthModule, TeamsModule, FilesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
