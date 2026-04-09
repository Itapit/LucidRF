import { TeamClientModule } from '@LucidRF/teams-contracts';
import { UserClientModule } from '@LucidRF/users-contracts';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, UserClientModule, TeamClientModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
